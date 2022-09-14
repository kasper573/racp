import { createRpcController } from "../../../lib/rpc/createRpcController";
import { RpcException } from "../../../lib/rpc/RpcException";
import { defined } from "../../../lib/defined";
import { createSearchController } from "../../common/search";
import { MapRepository } from "./repository";
import { mapDefinition } from "./definition";
import { mapInfoFilter, warpFilter } from "./types";

export async function mapController(maps: MapRepository) {
  return createRpcController(mapDefinition.entries, {
    searchMaps: createSearchController(
      async () => Array.from(Object.values(maps.info)),
      (entity, payload) => mapInfoFilter.for(payload)(entity)
    ),
    searchWarps: createSearchController(
      () => maps.warps,
      (entity, payload) => warpFilter.for(payload)(entity)
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
        throw new RpcException("A file must be uploaded");
      }
      const res = maps.updateInfo(Buffer.from(file.data).toString("utf8"));
      if (!res.success) {
        throw new Error("File could not be parsed as map info.");
      }
      return Object.values(res.data).map((map) => map.id);
    },
    async updateMapBounds(bounds) {
      maps.updateBounds(bounds);
    },
    async countMapBounds() {
      return Object.keys(maps.mapBounds).length;
    },
    async getMissingMapData() {
      const images = defined(
        await Promise.all(
          Object.keys(maps.info).map((id) =>
            maps.hasImage(id).then((has) => (!has ? id : undefined))
          )
        )
      );
      const bounds = defined(
        await Promise.all(
          Object.keys(maps.info).map((id) =>
            !maps.mapBounds[id] ? id : undefined
          )
        )
      );
      return { images, bounds };
    },
  });
}
