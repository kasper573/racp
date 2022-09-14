import { flatten, memoize, pick } from "lodash";
import * as zod from "zod";
import { useState } from "react";
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
import { MapBounds, MapBoundsRegistry } from "../../api/services/map/types";
import { GAT } from "../../lib/grf/types/GAT";
import { readFileStream } from "../../lib/grf/readFileStream";
import { allResolved } from "../../lib/allResolved";
import { Monster } from "../../api/services/monster/types";
import { ReducedLuaTables } from "../../api/services/util/types";
import { SPR } from "../../lib/grf/types/SPR";
import { canvasToBlob, imageDataToCanvas } from "../../lib/imageUtils";
import { defined } from "../../lib/defined";
import { usePromiseTracker } from "../../lib/usePromiseTracker";

export function useAssetUploader() {
  const [uploadMapImages, mapImageUpload] = useUploadMapImagesMutation();
  const [uploadMapInfo, mapInfoUpload] = useUploadMapInfoMutation();
  const [updateMapBounds, mapBoundsUpdate] = useUpdateMapBoundsMutation();
  const [updateItemInfo, itemInfoUpload] = useUploadItemInfoMutation();
  const [uploadMonsterImages] = useUploadMonsterImagesMutation();
  const [decompileLuaTables] = useDecompileLuaTableFilesMutation();
  const [customErrors, setCustomErrors] = useState<string[]>([]);

  const tracker = usePromiseTracker();

  const serverErrors = defined([
    mapImageUpload.error,
    mapInfoUpload.error,
    mapBoundsUpdate.error,
    itemInfoUpload.error,
  ]);

  const errors = [...serverErrors, ...tracker.errors, ...customErrors];

  async function uploadMapImageFiles(imageFiles: File[]) {
    const cropped = await tracker.track(
      `Cropping map images`,
      imageFiles.map((file) => () => cropMapImage(file))
    );
    const rpcFiles = await tracker.track(
      `Preparing map images for upload`,
      cropped.map((file) => () => toRpcFile(file))
    );

    await tracker.track(`Uploading map images`, [
      () => uploadMapImages(rpcFiles),
    ]);
  }

  async function uploadMapBoundsFromGAT(gatFiles: File[]) {
    const gatObjects = await tracker.track(
      "Unpacking map bounds",
      gatFiles.map((file) => () => new GAT(readFileStream, file).load())
    );

    const registry = createMapBoundsRegistry(gatFiles, gatObjects);
    await tracker.track(`Uploading map bounds`, [
      () => updateMapBounds(registry),
    ]);
  }

  async function uploadMapInfoLubFiles(lubFiles: File[]) {
    await tracker
      .track(
        "Unpacking map info file",
        lubFiles.map((file) => () => toRpcFile(file))
      )
      .then((files) =>
        tracker.track(`Uploading map info file`, [() => uploadMapInfo(files)])
      );
  }

  async function uploadMonsterImagesFromGRF(grf: GRF) {
    const [monsterSpriteInfo = []] = await tracker.track(
      "Running lua scripts to determine monster sprite names",
      [
        () =>
          determineMonsterSpriteInfo(grf, (files) =>
            decompileLuaTables(files).unwrap()
          ),
      ]
    );

    const monsterImages = await tracker.track(
      "Unpacking monster images",
      monsterSpriteInfo.map(({ id, spritePath }) => async () => {
        const file = await grf.getFile(spritePath);
        const spr = await new SPR(readFileStream, file, `${id}`).load();
        return toRpcFile(await spriteToTextureFile(spr));
      })
    );

    tracker.track("Uploading monster images", [
      () => uploadMonsterImages(monsterImages),
    ]);
  }

  async function uploadGRF(grf: GRF) {
    const monsterImagePromise = uploadMonsterImagesFromGRF(grf);

    const filesFromGRF = flatten(
      await tracker.track(
        "Unpacking map bounds and map images",
        unpackGATAndMapImageFiles(grf)
      )
    );

    const gatFiles = filesFromGRF.filter((file) => file.name.endsWith(".gat"));
    const imageFiles = filesFromGRF.filter((file) => isImage(file.name));

    await Promise.all([
      uploadMapImageFiles(imageFiles),
      uploadMapBoundsFromGAT(gatFiles),
      monsterImagePromise,
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

  function isImage(fileName: string) {
    return imageExtensions.some((ext) => fileName.endsWith(ext));
  }

  async function cropMapImage(file: File) {
    return cropSurroundingColors(file, [mapImageCropColor]);
  }

  return {
    ...pick(tracker, "isPending", "tasks", "progress"),
    upload,
    errors,
    fileExtensions: [".lub", ".grf"],
  };
}

const fileNameToMapName = (filename: string) =>
  /([^/\\]+)\.\w+$/.exec(filename)?.[1] ?? "";

function unpackGATAndMapImageFiles<Stream>(grf: GRF<Stream>) {
  const gatFilePathRegex = /^data\\(.*)\.gat$/;

  return Array.from(grf.files.keys())
    .filter((file) => gatFilePathRegex.test(file))
    .map((gatFilePath) => async () => {
      const mapName = fileNameToMapName(gatFilePath);
      const imageFilePath = `data\\texture\\à¯àúàîåíæäàì½º\\map\\${mapName}.bmp`;

      return allResolved([
        grf.getFile(imageFilePath),
        grf.getFile(gatFilePath),
      ]);
    });
}

function createMapBoundsRegistry(files: File[], bounds: MapBounds[]) {
  return bounds.reduce(
    (registry: MapBoundsRegistry, bounds, index) => ({
      ...registry,
      [fileNameToMapName(files[index].name)]: bounds,
    }),
    {}
  );
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

interface MonsterSpriteInfoEntry {
  id: Monster["Id"];
  spritePath: string;
}

const imageExtensions = [".png", ".jpg", ".jpeg", ".bmp", ".tga"];
const mapImageCropColor: RGB = [255, 0, 255]; // Magenta
