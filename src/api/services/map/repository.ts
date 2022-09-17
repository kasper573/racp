import * as fs from "fs";
import { FileStore } from "../../../lib/createFileStore";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { Linker } from "../../../lib/createPublicFileLinker";
import { ImageFormatter } from "../../../lib/createImageFormatter";
import { NpcDriver } from "../../rathena/NpcDriver";
import { createImageUpdater } from "../../common/createImageUpdater";
import { fileExists } from "../../../lib/fileExists";
import {
  MapBoundsRegistry,
  mapBoundsRegistryType,
  MapInfo,
  mapInfoType,
  warpType,
} from "./types";
export type MapRepository = ReturnType<typeof createMapRepository>;

export function createMapRepository({
  files,
  linker,
  formatter,
  npc,
}: {
  files: FileStore;
  linker: Linker;
  formatter: ImageFormatter;
  npc: NpcDriver;
}) {
  const mapLinker = linker.chain("maps");
  const mapImageName = (mapId: string) => `${mapId}${formatter.fileExtension}`;
  const mapImageUrl = (mapId: string) => mapLinker.url(mapImageName(mapId));
  const mapImagePath = (mapId: string) => mapLinker.path(mapImageName(mapId));

  const infoFile = files.entry("mapInfo.lub", parseMapInfo);
  const boundsFile = files.entry("mapBounds.json", (str) =>
    mapBoundsRegistryType.safeParse(JSON.parse(str))
  );

  async function getMaps() {
    const promises = Object.entries(infoFile.data ?? {}).map(
      async ([key, info]): Promise<MapInfo> => {
        const id = trimExtension(key);
        return {
          ...info,
          id,
          bounds: boundsFile.data?.[id],
          imageUrl: (await fileExists(mapImagePath(id)))
            ? mapImageUrl(id)
            : undefined,
        };
      }
    );

    const infoItems = await Promise.all(promises);
    return infoItems.reduce(
      (record: Record<string, MapInfo>, item) => ({
        ...record,
        [item.id]: item,
      }),
      {}
    );
  }

  return {
    getMaps,
    updateInfo: infoFile.update,
    countImages: () => fs.readdirSync(mapLinker.directory).length,
    warps: npc.resolve("scripts_warps.conf", warpType),
    updateImages: createImageUpdater(formatter, mapLinker),
    async updateBounds(registryChanges: MapBoundsRegistry) {
      const updatedRegistry = {
        ...(boundsFile.data ?? {}),
        ...registryChanges,
      };
      boundsFile.update(JSON.stringify(updatedRegistry, null, 2));
    },
    destroy: () => {
      infoFile.close();
      boundsFile.close();
    },
  };
}

const parseMapInfo = (luaCode: string) => parseLuaTableAs(luaCode, mapInfoType);

const trimExtension = (id: string) => id.replace(/\.[^.]+$/, "");
