import { FileStore } from "../../../lib/fs/createFileStore";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { Linker } from "../../../lib/fs/createPublicFileLinker";
import { ImageFormatter } from "../../../lib/image/createImageFormatter";
import { NpcDriver } from "../../rathena/NpcDriver";
import { createImageRepository } from "../../common/createImageRepository";
import { trimExtension } from "../../../lib/std/trimExtension";
import { Logger } from "../../../lib/logger";
import { gfs } from "../../util/gfs";
import { createMemo } from "../../../lib/createAsyncMemo";
import {
  MapBoundsRegistry,
  mapBoundsRegistryType,
  MapId,
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
  logger: parentLogger,
}: {
  files: FileStore;
  linker: Linker;
  formatter: ImageFormatter;
  npc: NpcDriver;
  logger: Logger;
}) {
  const logger = parentLogger.chain("map");
  const imageLinker = linker.chain("maps");
  const mapImageName = (mapId: string) => `${mapId}${formatter.fileExtension}`;
  const imageRepository = createImageRepository(formatter, imageLinker, logger);

  const infoFile = files.entry("mapInfo.lub", parseMapInfo);
  const boundsFile = files.entry("mapBounds.json", (str) =>
    mapBoundsRegistryType.safeParse(JSON.parse(str))
  );

  const getMaps = createMemo(
    () => [infoFile.data, boundsFile.data, imageRepository.urlMap] as const,
    (infoRecord, bounds, urlMap) => {
      logger.log("Recomputing map repository");
      return Object.entries(infoRecord ?? {}).reduce((all, [key, info]) => {
        const id = trimExtension(key);
        return all.set(id, {
          ...info,
          id,
          bounds: bounds?.[id],
          imageUrl: urlMap[mapImageName(id)],
        });
      }, new Map<MapId, MapInfo>());
    }
  );

  return {
    getMaps,
    updateInfo: infoFile.update,
    countImages: () =>
      gfs.readdir(imageLinker.directory).then((dirs) => dirs.length),
    warps: npc.resolve("scripts_warps.conf", warpType),
    updateImages: imageRepository.update,
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
      imageRepository.close();
    },
  };
}

const parseMapInfo = (luaCode: string) => parseLuaTableAs(luaCode, mapInfoType);
