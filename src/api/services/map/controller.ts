import { createRpcController } from "../../util/rpc";
import { RpcException } from "../../../lib/rpc/RpcException";
import { defined } from "../../../lib/defined";
import { createSearchController } from "../../common/search";
import { bufferToLuaCode } from "../../common/parseLuaTableAs";
import { MapRepository } from "./repository";
import { mapDefinition } from "./definition";
import { mapInfoFilter, warpFilter } from "./types";

export async function mapController(repo: MapRepository) {
  return createRpcController(mapDefinition.entries, {
    searchMaps: createSearchController(
      async () => Array.from((await repo.getMaps()).values()),
      (entity, payload) => mapInfoFilter.for(payload)(entity)
    ),
    searchWarps: createSearchController(
      () => repo.warps,
      (entity, payload) => warpFilter.for(payload)(entity)
    ),
    async getMap(mapId) {
      const maps = await repo.getMaps();
      const item = maps.get(mapId);
      if (!item) {
        throw new RpcException("Invalid map id");
      }
      return item;
    },
    countMapImages: repo.countImages,
    uploadMapImages: repo.updateImages,
    async countMapInfo() {
      return (await repo.getMaps()).size;
    },
    async uploadMapInfo([file]) {
      if (!file) {
        throw new RpcException("A file must be uploaded");
      }
      const res = repo.updateInfo(bufferToLuaCode(Buffer.from(file.data)));
      if (!res.success) {
        throw new Error("File could not be parsed as map info.");
      }
      return Object.values(res.data ?? {}).map((map) => map.id);
    },
    async updateMapBounds(bounds) {
      repo.updateBounds(bounds);
    },
    async countMapBounds() {
      return repo
        .getMaps()
        .then(
          (map) => Array.from(map.values()).filter((map) => !!map.bounds).length
        );
    },
    async getMissingMapData() {
      const maps = Array.from((await repo.getMaps()).values());
      const images = defined(
        maps.map(({ id, imageUrl }) => (!imageUrl ? id : undefined))
      );
      const bounds = defined(
        maps.map(({ id, bounds }) => (!bounds ? id : undefined))
      );
      return { images, bounds };
    },
  });
}
