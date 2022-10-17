import { flatten, uniq } from "lodash";
import * as zod from "zod";
import { FileStore } from "../../../lib/fs/createFileStore";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { Linker } from "../../../lib/fs/createPublicFileLinker";
import { ImageFormatter } from "../../../lib/image/createImageFormatter";
import { ImageUrlMap } from "../../common/ImageUrlMap";
import { trimExtension } from "../../../lib/std/trimExtension";
import { Logger } from "../../../lib/logger";
import { gfs } from "../../gfs";
import { createAsyncMemo } from "../../../lib/createMemo";
import { MonsterSpawn } from "../monster/types";
import { zodJsonProtocol } from "../../../lib/zod/zodJsonProtocol";
import { ResourceFactory } from "../../resources";
import {
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
  resources,
  getSpawns,
  logger: parentLogger,
}: {
  files: FileStore;
  linker: Linker;
  formatter: ImageFormatter;
  getSpawns: () => Promise<MonsterSpawn[]>;
  resources: ResourceFactory;
  logger: Logger;
}) {
  const logger = parentLogger.chain("map");
  const imageLinker = linker.chain("maps");
  const mapImageName = (mapId: string) => `${mapId}${formatter.fileExtension}`;
  const imageUrlMap = new ImageUrlMap({
    formatter,
    linker: imageLinker,
    logger,
  });

  const warps = resources.script(warpType);

  const infoFile = files.entry({
    relativeFilename: "mapInfo.json",
    protocol: zodJsonProtocol(zod.record(mapInfoType)),
  });

  const boundsFile = files.entry({
    relativeFilename: "mapBounds.json",
    protocol: zodJsonProtocol(mapBoundsRegistryType),
  });

  const getMaps = createAsyncMemo(
    () =>
      Promise.all([
        warps.read(),
        getSpawns(),
        infoFile.read(),
        boundsFile.read(),
        imageUrlMap.read(),
      ]),
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
    updateInfo(luaCode: string) {
      return infoFile.assign(parseLuaTableAs(luaCode, mapInfoType));
    },
    countImages: () =>
      gfs.readdir(imageLinker.directory).then((dirs) => dirs.length),
    warps: warps.read(),
    updateImages: imageUrlMap.update,
    updateBounds: boundsFile.assign,
    destroy: () => {
      infoFile.dispose();
      boundsFile.dispose();
      imageUrlMap.dispose();
    },
  };
}
