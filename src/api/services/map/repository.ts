import { flatten, uniq } from "lodash";
import * as zod from "zod";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { trimExtension } from "../../../lib/std/trimExtension";
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
  resources,
  getSpawns,
}: {
  getSpawns: () => Promise<MonsterSpawn[]>;
  resources: ResourceFactory;
}) {
  const images = resources.images("maps");
  const mapImageName = (mapId: string) => `${mapId}${images.fileExtension}`;

  const warps = resources.script(warpType);

  const infoFile = resources.file({
    relativeFilename: "mapInfo.json",
    protocol: zodJsonProtocol(zod.record(mapInfoType)),
  });

  const boundsFile = resources.file({
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
        images.read(),
      ]),
    (warps, spawns, infoRecord, bounds, urlMap) => {
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
      gfs.readdir(images.directory).then((dirs) => dirs.length),
    warps: warps.read(),
    updateImages: images.update,
    updateBounds: boundsFile.assign,
    destroy: () => {
      infoFile.dispose();
      boundsFile.dispose();
      images.dispose();
    },
  };
}
