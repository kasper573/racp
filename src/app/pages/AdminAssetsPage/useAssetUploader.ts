import { chunk, flatten, pick, uniq } from "lodash";
import * as zod from "zod";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  cropSurroundingColors,
  RGB,
} from "../../../lib/image/cropSurroundingColors";
import { CANCEL_INVALIDATE, trpc } from "../../state/client";
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
import { toRpcFile } from "../../util/rpcFileUtils";
import { typedKeys } from "../../../lib/std/typedKeys";

export function useAssetUploader() {
  // Since we're uploading so much we don't want mutations to invalidate cache.
  // We'll invalidate it manually when we're done.
  const opts = { onSuccess: () => CANCEL_INVALIDATE };
  const queryClient = useQueryClient();
  const trpcClient = trpc.useContext();

  const { mutateAsync: uploadMapImages, ...mapImageUpload } =
    trpc.map.uploadImages.useMutation(opts);
  const { mutateAsync: uploadMapInfo, ...mapInfoUpload } =
    trpc.map.uploadInfo.useMutation(opts);
  const { mutateAsync: updateMapBounds, ...mapBoundsUpdate } =
    trpc.map.updateBounds.useMutation(opts);
  const { mutateAsync: updateItemInfo, ...itemInfoUpload } =
    trpc.item.uploadInfo.useMutation(opts);
  const { mutateAsync: uploadItemImages, ...itemImageUpload } =
    trpc.item.uploadImages.useMutation(opts);
  const { mutateAsync: uploadMonsterImages, ...monsterImageUpload } =
    trpc.monster.uploadImages.useMutation(opts);
  const { mutateAsync: uploadItemOptionTexts } =
    trpc.item.uploadOptionTexts.useMutation(opts);
  const { mutateAsync: reduceLuaTableFiles } =
    trpc.util.reduceLuaTableFiles.useMutation(opts);

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

  async function uploadMapData(
    grf?: GRF,
    mapInfoFile?: File,
    shouldUpload = assetTypeList
  ) {
    if (mapInfoFile && shouldUpload.includes("Map info")) {
      await tracker.track([
        {
          group: `Uploading map info`,
          fn: () => toRpcFile(mapInfoFile).then(uploadMapInfo),
        },
      ]);
    }

    if (!grf || !shouldUpload.includes("Map images")) {
      return;
    }

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

  async function uploadMonsterData(grf?: GRF, shouldUpload = assetTypeList) {
    if (!grf || shouldUpload.includes("Monster images")) {
      return;
    }

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

  async function uploadItemData(
    grf?: GRF,
    infoFile?: File,
    shouldUpload = assetTypeList
  ) {
    if (infoFile && shouldUpload.includes("Item info")) {
      await tracker.track([
        {
          group: "Uploading item info",
          fn: async () => updateItemInfo(await toRpcFile(infoFile)),
        },
      ]);
    }

    if (!grf || !shouldUpload.includes("Item images")) {
      return;
    }

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
        group: "Downloading resource names",
        fn: () => trpcClient.item.resourceNames.fetch(),
      },
    ]);

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

  async function upload(files: AssetSourceFiles, shouldUpload = assetTypeList) {
    tracker.reset();

    const [grf] = files.data
      ? await tracker.track([
          {
            group: "Loading GRF file",
            id: files.data.name,
            fn: () => GRF.load(files.data!),
          },
        ])
      : [];

    // Sequence to save memory (since we're dealing with potentially several GB of data)
    await uploadMapData(grf, files.mapInfo, shouldUpload);
    await uploadItemData(grf, files.itemInfo, shouldUpload);
    await uploadMonsterData(grf, shouldUpload);

    // Done, invalidate query cache
    queryClient.invalidateQueries();
  }

  return {
    ...pick(tracker, "isPending", "progress"),
    currentActivities,
    upload,
    errors,
  };
}
export type AssetSourceFiles = Partial<Record<AssetSourceFile, File>>;

export type AssetSourceFile = keyof typeof sourceFileExtensions;
export const sourceFileExtensions = {
  mapInfo: ".lub",
  itemInfo: ".lub",
  data: ".grf",
} as const;
export const sourceFileList = typedKeys(sourceFileExtensions);

export type AssetTypeId = keyof typeof assetTypes;
export const assetTypes = {
  "Map info": ["mapInfo"],
  "Map images": ["mapInfo", "data"],
  "Item info": ["itemInfo"],
  "Item images": ["itemInfo", "data"],
  "Monster images": ["data"],
} as const;
export const assetTypeList = typedKeys(assetTypes);

export function assetTypesToSourceFiles(
  types: AssetTypeId[]
): AssetSourceFile[] {
  return uniq(
    types.reduce(
      (sum, id) => [...sum, ...assetTypes[id]],
      [] as AssetSourceFile[]
    )
  );
}

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
  const table = await reduceLuaTableFiles([
    await getDataInfo(grf, "npcidentity.lub").then(toRpcFile),
    await getDataInfo(grf, "jobname.lub").then(toRpcFile),
  ]);

  return zod.record(zod.string()).parse(table);
}

async function loadItemOptionTexts(
  grf: GRF,
  reduceLuaTableFiles: (files: RpcFile[]) => Promise<ReducedLuaTables>
): Promise<Record<number, string>> {
  const table = await reduceLuaTableFiles([
    await getDataInfo(grf, "enumvar.lub").then(toRpcFile),
    await getDataInfo(grf, "addrandomoptionnametable.lub").then(toRpcFile),
  ]);

  return zod.record(zod.string()).parse(table);
}

function getDataInfo(grf: GRF, filename: string) {
  return getLuaFile(grf, `datainfo\\${filename}`);
}

async function getLuaFile(grf: GRF, localPath: string) {
  try {
    return await grf.getEntry(`data\\LuaFiles514\\lua files\\${localPath}`);
  } catch {
    return await grf.getEntry(`data\\lua files\\${localPath}`);
  }
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
