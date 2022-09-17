import { createRpcController } from "../../util/rpc";
import { RpcException } from "../../../lib/rpc/RpcException";
import { defined } from "../../../lib/defined";
import { createSearchController } from "../../common/search";
import { MapRepository } from "./repository";
import { mapDefinition } from "./definition";
import { mapInfoFilter, warpFilter } from "./types";

export async function mapController(repo: MapRepository) {
  return createRpcController(mapDefinition.entries, {
    searchMaps: createSearchController(
      async () => Array.from(Object.values(await repo.getMaps())),
      (entity, payload) => mapInfoFilter.for(payload)(entity)
    ),
    searchWarps: createSearchController(
      () => repo.warps,
      (entity, payload) => warpFilter.for(payload)(entity)
    ),
    async getMap(mapId) {
      const maps = await repo.getMaps();
      const item = maps[mapId];
      if (!item) {
        throw new RpcException("Invalid map id");
      }
      return item;
    },
    async countMapImages() {
      return repo.countImages();
    },
    async uploadMapImages(files) {
      return repo.updateImages(
        files.map(({ name, data }) => ({ name, data: new Uint8Array(data) }))
      );
    },
    async countMapInfo() {
      return Object.keys(await repo.getMaps()).length;
    },
    async uploadMapInfo([file]) {
      if (!file) {
        throw new RpcException("A file must be uploaded");
      }
      const res = repo.updateInfo(Buffer.from(file.data).toString("utf8"));
      if (!res.success) {
        throw new Error("File could not be parsed as map info.");
      }
      return Object.values(res.data).map((map) => map.id);
    },
    async updateMapBounds(bounds) {
      repo.updateBounds(bounds);
    },
    async countMapBounds() {
      return repo
        .getMaps()
        .then(
          (record) => Object.values(record).filter((map) => !!map.bounds).length
        );
    },
    async getMissingMapData() {
      const maps = Object.values(await repo.getMaps());
      const images = defined(
        maps.map(({ id, imageUrl }) => (imageUrl ? id : undefined))
      );
      const bounds = defined(
        maps.map(({ id, bounds }) => (bounds ? id : undefined))
      );
      return { images, bounds };
    },
  });
}
