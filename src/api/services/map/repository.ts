import { flatten, uniq } from "lodash";
import { FileStore } from "../../../lib/fs/createFileStore";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { Linker } from "../../../lib/fs/createPublicFileLinker";
import { ImageFormatter } from "../../../lib/image/createImageFormatter";
import { NpcDriver } from "../../rathena/NpcDriver";
import { createImageRepository } from "../../common/createImageRepository";
import { trimExtension } from "../../../lib/std/trimExtension";
import { Logger } from "../../../lib/logger";
import { gfs } from "../../util/gfs";
import { createAsyncMemo } from "../../../lib/createMemo";
import { MonsterSpawn } from "../monster/types";
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
  getSpawns,
  logger: parentLogger,
}: {
  files: FileStore;
  linker: Linker;
  formatter: ImageFormatter;
  getSpawns: () => Promise<MonsterSpawn[]>;
  npc: NpcDriver;
  logger: Logger;
}) {
  const logger = parentLogger.chain("map");
  const imageLinker = linker.chain("maps");
  const mapImageName = (mapId: string) => `${mapId}${formatter.fileExtension}`;
  const imageRepository = createImageRepository(formatter, imageLinker, logger);

  const warpsPromise = npc.resolve("scripts_warps.conf", warpType);
  const infoFile = files.entry("mapInfo.lub", parseMapInfo);
  const boundsFile = files.entry("mapBounds.json", (str) =>
    mapBoundsRegistryType.safeParse(JSON.parse(str))
  );

  const getMaps = createAsyncMemo(
    async () =>
      [
        await warpsPromise,
        await getSpawns(),
        infoFile.data,
        boundsFile.data,
        imageRepository.urlMap,
      ] as const,
    (warps, spawns, infoRecord, bounds, urlMap) => {
      logger.log("Recomputing map repository");

      // Resolve maps via info records
      const maps = Object.entries(infoRecord ?? {}).reduce(
        (all, [key, info]) => {
          const id = trimExtension(key);
          return all.set(id, { ...info, id });
        },
        new Map<MapId, MapInfo>()
      );

      // Resolve maps via npc entries
      const mapIdsFromWarpsAndSpawns = uniq([
        ...spawns.map((spawn) => spawn.map),
        ...flatten(warps.map((warp) => [warp.fromMap, warp.toMap])),
      ]);

      for (const id of mapIdsFromWarpsAndSpawns) {
        if (!maps.has(id)) {
          maps.set(id, mapInfoType.parse({ id, displayName: id }));
        }
      }

      // Resolve map bounds and images
      for (const map of maps.values()) {
        map.bounds = bounds?.[map.id];
        map.imageUrl = urlMap[mapImageName(map.id)];
      }

      return maps;
    }
  );

  return {
    getMaps,
    updateInfo: infoFile.update,
    countImages: () =>
      gfs.readdir(imageLinker.directory).then((dirs) => dirs.length),
    warps: warpsPromise,
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
