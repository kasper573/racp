import { flatten, uniq } from "lodash";
import * as zod from "zod";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { trimExtension } from "../../../lib/std/trimExtension";
import { MonsterSpawn } from "../monster/types";
import { zodJsonProtocol } from "../../../lib/zod/zodJsonProtocol";
import { ResourceFactory } from "../../resources";
import { Repository } from "../../../lib/repo/Repository";
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
  spawns,
}: {
  spawns: Repository<MonsterSpawn[]>;
  resources: ResourceFactory;
}) {
  const images = resources.images("maps");
  const mapImageName = (mapId: string) => `${mapId}${images.fileExtension}`;

  const warps = resources.script(warpType);

  const info = resources.file({
    relativeFilename: "mapInfo.json",
    protocol: zodJsonProtocol(zod.record(mapInfoType)),
    defaultValue: {},
  });

  const bounds = resources.file({
    relativeFilename: "mapBounds.json",
    protocol: zodJsonProtocol(mapBoundsRegistryType),
  });

  const maps = warps
    .and(spawns, info, bounds, images)
    .map("maps", ([warps, spawns, infoRecord, bounds, urlMap]) => {
      // Resolve maps via info records
      const maps = Object.entries(infoRecord).reduce((all, [key, info]) => {
        const id = trimExtension(key);
        return all.set(id, { ...info, id });
      }, new Map<MapId, MapInfo>());

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
    });

  return {
    info,
    maps,
    warps,
    images,
    bounds,
    updateInfo(luaCode: string) {
      return info.assign(parseLuaTableAs(luaCode, mapInfoType));
    },
  };
}
