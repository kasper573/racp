import { memoize, pick } from "lodash";
import * as zod from "zod";
import { useMemo, useState } from "react";
import { cropSurroundingColors, RGB } from "../../lib/cropSurroundingColors";
import {
  useDecompileLuaTableFilesMutation,
  useUpdateMapBoundsMutation,
  useUploadItemInfoMutation,
  useUploadMapImagesMutation,
  useUploadMapInfoMutation,
  useUploadMonsterImagesMutation,
} from "../state/client";
import { RpcFile, toRpcFile } from "../../lib/rpc/RpcFile";
import { GRF } from "../../lib/grf/types/GRF";
import { GAT } from "../../lib/grf/types/GAT";
import { readFileStream } from "../../lib/grf/readFileStream";
import { Monster } from "../../api/services/monster/types";
import { ReducedLuaTables } from "../../api/services/util/types";
import { SPR } from "../../lib/grf/types/SPR";
import { canvasToBlob, imageDataToCanvas } from "../../lib/imageUtils";
import { defined } from "../../lib/defined";
import {
  describeTask,
  describeTaskGroup,
  TaskRejectionReason,
  useTaskScheduler,
} from "../../lib/useTaskScheduler";
import { MapBoundsRegistry } from "../../api/services/map/types";

export function useAssetUploader() {
  const [uploadMapImages, mapImageUpload] = useUploadMapImagesMutation();
  const [uploadMapInfo, mapInfoUpload] = useUploadMapInfoMutation();
  const [updateMapBounds, mapBoundsUpdate] = useUpdateMapBoundsMutation();
  const [updateItemInfo, itemInfoUpload] = useUploadItemInfoMutation();
  const [uploadMonsterImages] = useUploadMonsterImagesMutation();
  const [decompileLuaTables] = useDecompileLuaTableFilesMutation();
  const [customErrors, setCustomErrors] = useState<string[]>([]);

  const tracker = useTaskScheduler({ defaultPriority: Math.random });

  const trackerErrors = useMemo(
    () =>
      tracker.tasks
        .filter((task) => task.state === "rejected")
        .reduce(
          (list: TaskRejectionReason[], task) => [
            ...list,
            `${describeTask(task)}: ${task.rejectionReason}`,
          ],
          []
        ),
    [tracker.tasks]
  );

  const currentActivities = useMemo(
    () =>
      tracker.groups
        .filter((group) => group.pending.length > 0)
        .map(describeTaskGroup),
    [tracker.groups]
  );

  const serverErrors = defined([
    mapImageUpload.error,
    mapInfoUpload.error,
    mapBoundsUpdate.error,
    itemInfoUpload.error,
  ]);

  const errors = [...serverErrors, ...trackerErrors, ...customErrors];

  async function uploadMapDataFromGRF(grf: GRF) {
    const mapData = await tracker.track(
      createMapDataUnpackJobs(grf).map((fn) => ({
        group: "Unpacking map data",
        fn,
      }))
    );

    const images = defined(mapData.map(({ image }) => image));
    const bounds = mapData.reduce(
      (bounds: MapBoundsRegistry, { gat }) =>
        gat ? { ...bounds, [fileNameToMapName(gat.name)]: gat } : bounds,
      {}
    );

    await Promise.allSettled([
      tracker.track([
        {
          group: "Uploading map images",
          fn: () => uploadMapImages(images),
        },
      ]),
      tracker.track([
        { group: `Uploading map bounds`, fn: () => updateMapBounds(bounds) },
      ]),
    ]);
  }

  async function uploadMapInfoLubFiles(lubFiles: File[]) {
    await tracker
      .track(
        lubFiles.map((file) => ({
          group: "Unpacking map info file",
          id: file.name,
          fn: () => toRpcFile(file),
        }))
      )
      .then((files) =>
        tracker.track([
          { group: `Uploading map info file`, fn: () => uploadMapInfo(files) },
        ])
      );
  }

  async function uploadMonsterImagesFromGRF(grf: GRF) {
    const [monsterSpriteInfo = []] = await tracker.track([
      {
        schedule: { priority: 0 },
        group: "Locating monster images",
        fn: () =>
          determineMonsterSpriteInfo(grf, (files) =>
            decompileLuaTables(files).unwrap()
          ),
      },
    ]);

    const monsterImages = await tracker.track(
      monsterSpriteInfo.map(({ id, spritePath }) => ({
        group: "Unpacking monster images",
        id: spritePath,
        fn: async () => {
          const file = await grf.getFile(spritePath);
          const spr = await new SPR(readFileStream, file, `${id}`).load();
          return toRpcFile(await spriteToTextureFile(spr));
        },
      }))
    );

    tracker.track([
      {
        group: "Uploading monster images",
        fn: () => uploadMonsterImages(monsterImages),
      },
    ]);
  }

  async function uploadGRF(grf: GRF) {
    await Promise.allSettled([
      uploadMapDataFromGRF(grf),
      uploadMonsterImagesFromGRF(grf),
    ]);
  }

  async function upload(files: File[]) {
    setCustomErrors([]);
    tracker.reset();

    const results = await Promise.allSettled(
      files.map(async (file) => {
        if (/mapinfo.*\.lub/i.test(file.name)) {
          await uploadMapInfoLubFiles([file]);
        } else if (/iteminfo.*\.lub/i.test(file.name)) {
          await updateItemInfo([await toRpcFile(file)]);
        } else if (file.name.endsWith(".grf")) {
          await uploadGRF(await new GRF(readFileStream, file).load());
        } else {
          throw new Error(`File name or type not recognized: ${file.name}`);
        }
      })
    );

    setCustomErrors(
      defined(results.map((res) => res.status === "rejected" && res.reason))
    );
  }

  return {
    ...pick(tracker, "isPending", "progress"),
    currentActivities,
    upload,
    errors,
    fileExtensions: [".lub", ".grf"],
  };
}

const fileNameToMapName = (filename: string) =>
  /([^/\\]+)\.\w+$/.exec(filename)?.[1] ?? "";

function createMapDataUnpackJobs<Stream>(grf: GRF<Stream>) {
  const gatFilePathRegex = /^data\\(.*)\.gat$/;

  return Array.from(grf.files.keys())
    .filter((file) => gatFilePathRegex.test(file))
    .map((gatFilePath) => async () => {
      const mapName = fileNameToMapName(gatFilePath);
      const imageFilePath = `data\\texture\\à¯àúàîåíæäàì½º\\map\\${mapName}.bmp`;

      const [gatResult, imageResult] = await Promise.allSettled([
        grf
          .getFile(gatFilePath)
          .then((file) => new GAT(readFileStream, file, file.name).load()),
        grf.getFile(imageFilePath).then(cropMapImage).then(toRpcFile),
      ]);

      const gat =
        gatResult.status === "fulfilled" ? gatResult.value : undefined;
      const image =
        imageResult.status === "fulfilled" ? imageResult.value : undefined;
      return { gat, image };
    });
}

async function determineMonsterSpriteInfo(
  grf: GRF,
  decompileLuaTables: (files: RpcFile[]) => Promise<ReducedLuaTables>
): Promise<MonsterSpriteInfoEntry[]> {
  const identityFile = await grf
    .getFile("data\\lua files\\datainfo\\npcidentity.lub")
    .then(toRpcFile);

  const nameFile = await grf
    .getFile("data\\lua files\\datainfo\\jobname.lub")
    .then(toRpcFile);

  const table = await decompileLuaTables([identityFile, nameFile]);

  const monsterIdToSpriteName = zod.record(zod.string()).parse(table);

  const allSpritePaths = Array.from(grf.files.keys()).filter((path) =>
    path.endsWith(".spr")
  );

  const findSpritePath = memoize(allSpritePaths.find.bind(allSpritePaths));

  const infoEntries = Object.entries(monsterIdToSpriteName).map(
    ([monsterId, spriteName]) => ({
      id: parseInt(monsterId, 10),
      spritePath: findSpritePath((path) =>
        path.endsWith(`\\${spriteName.toLowerCase()}.spr`)
      ),
    })
  );

  return infoEntries.filter(
    (entry): entry is MonsterSpriteInfoEntry => entry.spritePath !== undefined
  );
}

async function spriteToTextureFile(sprite: SPR) {
  const frame = sprite.compileFrame(0);
  const blob = await canvasToBlob(
    imageDataToCanvas(
      new ImageData(
        new Uint8ClampedArray(frame.data),
        frame.width,
        frame.height
      )
    )
  );
  return new File([blob], sprite.name);
}

async function cropMapImage(file: File) {
  return cropSurroundingColors(file, [mapImageCropColor]);
}

interface MonsterSpriteInfoEntry {
  id: Monster["Id"];
  spritePath: string;
}

const mapImageCropColor: RGB = [255, 0, 255]; // Magenta
