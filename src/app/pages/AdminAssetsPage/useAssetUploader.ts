import { chunk, flatten, pick } from "lodash";
import * as zod from "zod";
import { useMemo } from "react";
import {
  cropSurroundingColors,
  RGB,
} from "../../../lib/image/cropSurroundingColors";
import { trpc } from "../../state/client";
import { encodeRpcFileData, RpcFile } from "../../../api/common/RpcFile";
import { GRF } from "../../../lib/grf/types/GRF";
import { GAT } from "../../../lib/grf/types/GAT";
import { ReducedLuaTables } from "../../../api/services/util/types";
import { RGBABitmap, SPR } from "../../../lib/grf/types/SPR";
import { defined } from "../../../lib/std/defined";
import {
  describeTask,
  describeTaskGroup,
  InputTask,
  TaskRejectionReason,
  useTaskScheduler,
} from "../../../lib/hooks/useTaskScheduler";
import { MapBoundsRegistry } from "../../../api/services/map/types";
import { getErrorMessage } from "../../components/ErrorMessage";
import { trimExtension } from "../../../lib/std/trimExtension";
import { canvasToBlob } from "../../../lib/image/canvasToBlob";
import { imageDataToCanvas } from "../../../lib/image/imageDataToCanvas";

export function useAssetUploader() {
  const { mutateAsync: uploadMapImages, ...mapImageUpload } =
    trpc.map.uploadImages.useMutation();
  const { mutateAsync: uploadMapInfo, ...mapInfoUpload } =
    trpc.map.uploadInfo.useMutation();
  const { mutateAsync: updateMapBounds, ...mapBoundsUpdate } =
    trpc.map.updateBounds.useMutation();
  const { mutateAsync: updateItemInfo, ...itemInfoUpload } =
    trpc.item.uploadInfo.useMutation();
  const { mutateAsync: uploadItemImages, ...itemImageUpload } =
    trpc.item.uploadImages.useMutation();
  const { mutateAsync: uploadMonsterImages, ...monsterImageUpload } =
    trpc.monster.uploadImages.useMutation();
  const { mutateAsync: uploadItemOptionTexts } =
    trpc.item.uploadOptionTexts.useMutation();
  const { mutateAsync: reduceLuaTableFiles } =
    trpc.util.reduceLuaTableFiles.useMutation();

  const tracker = useTaskScheduler();

  const trackerErrors = useMemo(
    () =>
      tracker.tasks
        .filter((task) => task.state === "rejected")
        .reduce(
          (list: TaskRejectionReason[], task) => [
            ...list,
            `${describeTask(task)}: ${getErrorMessage(task.rejectionReason)}`,
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
    itemImageUpload.error,
    monsterImageUpload.error,
  ]);

  const errors = [...serverErrors, ...trackerErrors];

  async function uploadMapData(grf: GRF, mapInfoFile: File) {
    await tracker.track([
      {
        group: `Uploading map info`,
        fn: () => toRpcFile(mapInfoFile).then(uploadMapInfo),
      },
    ]);

    const boundsAndImages = await tracker.track(createMapDataUnpackJobs(grf));

    const images = defined(boundsAndImages.map(({ image }) => image));
    const bounds = boundsAndImages.reduce(
      (bounds: MapBoundsRegistry, { gat }) => {
        if (gat) {
          bounds[fileNameToMapName(gat.name)] = gat;
        }
        return bounds;
      },
      {}
    );

    await tracker.track([
      { group: `Uploading map bounds`, fn: () => updateMapBounds(bounds) },
    ]);

    await tracker.track(
      divide(images, 100).map((partial) => ({
        group: "Uploading map image packs",
        fn: () => uploadMapImages(partial),
      }))
    );
  }

  async function uploadMonsterData(grf: GRF) {
    const [monsterSpriteInfo = []] = await tracker.track([
      {
        group: "Locating monster images",
        fn: () =>
          loadMonsterSpriteNames(grf, reduceLuaTableFiles).then((names) =>
            resolveSpriteInfo(grf, names)
          ),
      },
    ]);

    const monsterImages = flatten(
      await tracker.track(
        monsterSpriteInfo.map((info) => ({
          group: "Unpacking monster images",
          id: info.sourcePath,
          fn: () => loadSpriteFromGRF(grf, info),
        }))
      )
    );

    await tracker.track(
      divide(monsterImages, 100).map((partial) => ({
        group: "Uploading monster image packs",
        fn: () => uploadMonsterImages(partial),
      }))
    );
  }

  async function uploadItemData(grf: GRF, infoFile: File) {
    await tracker.track([
      {
        group: "Uploading item option texts",
        fn: () =>
          loadItemOptionTexts(grf, reduceLuaTableFiles).then(
            uploadItemOptionTexts
          ),
      },
    ]);

    const [resourceNames] = await tracker.track([
      {
        group: "Uploading item info",
        fn: async () => {
          const res = await updateItemInfo(await toRpcFile(infoFile));
          if (!Object.keys(res).length) {
            throw new Error("No resource names found in item info file");
          }
          return res;
        },
      },
    ]);

    if (!resourceNames) {
      return;
    }

    const itemImages = flatten(
      await tracker.track(
        resolveSpriteInfo(grf, resourceNames).map((info) => ({
          group: "Unpacking item images",
          id: info.sourcePath,
          fn: () => loadSpriteFromGRF(grf, info),
        }))
      )
    );

    await tracker.track(
      divide(itemImages, 100).map((partial) => ({
        group: "Uploading item image packs",
        fn: () => uploadItemImages(partial),
      }))
    );
  }

  async function upload(mapInfoFile: File, itemInfoFile: File, grfFile: File) {
    tracker.reset();

    const [grf] = await tracker.track([
      {
        group: "Loading GRF file",
        id: grfFile.name,
        fn: () => GRF.load(grfFile),
      },
    ]);

    if (!grf) {
      return;
    }

    // Sequence to save memory (since we're dealing with potentially several GB of data)
    await uploadMapData(grf, mapInfoFile);
    await uploadMonsterData(grf);
    await uploadItemData(grf, itemInfoFile);
  }

  return {
    ...pick(tracker, "isPending", "progress"),
    currentActivities,
    upload,
    errors,
  };
}

export type UploaderFileName = keyof typeof uploaderFilesRequired;
export const uploaderFilesRequired = {
  mapInfo: ".lub",
  itemInfo: ".lub",
  data: ".grf",
} as const;

const fileNameToMapName = (filename: string) =>
  /([^/\\]+)\.\w+$/.exec(filename)?.[1] ?? "";

function createMapDataUnpackJobs<Stream>(
  grf: GRF<Stream>
): Array<InputTask<{ gat?: GAT; image?: RpcFile }>> {
  const gatFilePathRegex = /^data\\(.*)\.gat$/;

  return Array.from(grf.files.keys())
    .filter((file) => gatFilePathRegex.test(file))
    .map((gatFilePath) => ({
      group: "Unpacking map data",
      id: gatFilePath,
      fn: async () => {
        const mapName = fileNameToMapName(gatFilePath);
        const imageFilePath = `data\\texture\\à¯àúàîåíæäàì½º\\map\\${mapName}.bmp`;

        const [gatResult, imageResult] = await Promise.allSettled([
          grf
            .getEntry(gatFilePath)
            .then(({ data, name }) => new GAT(data, name)),
          grf
            .getEntry(imageFilePath)
            .then(({ data, name }) => new File([data], name))
            .then(cropMapImage)
            .then(toRpcFile),
        ]);

        const gat =
          gatResult.status === "fulfilled" ? gatResult.value : undefined;
        const image =
          imageResult.status === "fulfilled" ? imageResult.value : undefined;
        return { gat, image };
      },
    }));
}

async function loadMonsterSpriteNames(
  grf: GRF,
  reduceLuaTableFiles: (files: RpcFile[]) => Promise<ReducedLuaTables>
): Promise<Record<number, string>> {
  const identityFile = await grf
    .getEntry("data\\lua files\\datainfo\\npcidentity.lub")
    .then(toRpcFile);

  const nameFile = await grf
    .getEntry("data\\lua files\\datainfo\\jobname.lub")
    .then(toRpcFile);

  const table = await reduceLuaTableFiles([identityFile, nameFile]);

  return zod.record(zod.string()).parse(table);
}

async function loadItemOptionTexts(
  grf: GRF,
  reduceLuaTableFiles: (files: RpcFile[]) => Promise<ReducedLuaTables>
): Promise<Record<number, string>> {
  const enumVarFile = await grf
    .getEntry("data\\lua files\\datainfo\\enumvar.lub")
    .then(toRpcFile);

  const nameTableFile = await grf
    .getEntry("data\\lua files\\datainfo\\addrandomoptionnametable.lub")
    .then(toRpcFile);

  const table = await reduceLuaTableFiles([enumVarFile, nameTableFile]);

  return zod.record(zod.string()).parse(table);
}

function resolveSpriteInfo(
  grf: GRF,
  idToSpriteName: Record<number, string>
): SpriteInfo[] {
  const normalizeSpriteName = (name: string) => name.toLowerCase();
  const spriteNameToIds = Object.entries(idToSpriteName).reduce(
    (existing: Record<string, string[]>, [id, spriteName]) => {
      const key = normalizeSpriteName(spriteName);
      if (existing[key]) {
        existing[key].push(id);
      } else {
        existing[key] = [id];
      }
      return existing;
    },
    {}
  );

  const infoList: SpriteInfo[] = [];
  for (const entry of grf.files.values()) {
    if (!entry.path.endsWith(".spr")) {
      continue;
    }
    const key = normalizeSpriteName(trimExtension(entry.name));
    const ids = spriteNameToIds[key] ?? [];
    if (ids.length > 0) {
      infoList.push({
        outputNames: ids,
        sourcePath: entry.path,
      });
    }
  }

  return infoList;
}

async function loadSpriteFromGRF(
  grf: GRF,
  { outputNames, sourcePath }: SpriteInfo
): Promise<RpcFile[]> {
  const { data: sprData } = await grf.getEntry(sourcePath);
  const spr = await new SPR(sprData);
  const frame = spr.compileFrame(0);
  const blob = await frameToBlob(frame);
  const data = encodeRpcFileData(new Uint8Array(await blob.arrayBuffer()));
  return outputNames.map((name) => ({ name, data }));
}

async function frameToBlob(frame: RGBABitmap) {
  return canvasToBlob(
    imageDataToCanvas(
      new ImageData(
        new Uint8ClampedArray(frame.data),
        frame.width,
        frame.height
      )
    )
  );
}

async function cropMapImage(file: File) {
  return cropSurroundingColors(file, [mapImageCropColor]);
}

interface SpriteInfo {
  sourcePath: string;
  outputNames: string[];
}

const mapImageCropColor: RGB = [255, 0, 255]; // Magenta

const divide = <T>(list: T[], parts: number): T[][] =>
  chunk(list, Math.ceil(list.length / parts));

async function toRpcFile(
  file: File | { data: Uint8Array; name: string }
): Promise<RpcFile> {
  const data =
    "data" in file ? file.data : new Uint8Array(await file.arrayBuffer());
  return {
    name: file.name,
    data: encodeRpcFileData(data),
  };
}
