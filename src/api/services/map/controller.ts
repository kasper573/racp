import { createRpcController } from "../../../lib/rpc/createRpcController";
import { createSearchController } from "../search/controller";
import { RpcException } from "../../../lib/rpc/RpcException";
import { MapRepository } from "./repository";
import { mapDefinition } from "./definition";
import { mapInfoFilter } from "./types";

export async function mapController(maps: MapRepository) {
  return createRpcController(mapDefinition.entries, {
    searchMaps: createSearchController(
      async () => Array.from(Object.values(maps.info)),
      (entity, payload) => mapInfoFilter.for(payload)(entity)
    ),
    async getMap(mapId) {
      const item = maps.info[mapId];
      if (!item) {
        throw new RpcException("Invalid map id");
      }
      return item;
    },
    async countMapImages() {
      return maps.countImages();
    },
    async uploadMapImages(files) {
      return maps.updateImages(
        files.map(({ name, data }) => ({ name, data: new Uint8Array(data) }))
      );
    },
    async countMapInfo() {
      return Object.keys(maps.info).length;
    },
    async uploadMapInfo([file]) {
      if (!file) {
        return [];
      }
      const res = maps.updateInfo(Buffer.from(file.data).toString("utf8"));
      if (!res.success) {
        return [];
      }
      return Object.values(res.data).map((map) => map.id);
    },
  });
}
