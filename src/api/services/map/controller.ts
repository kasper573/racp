import { createRpcController } from "../../../lib/rpc/createRpcController";
import { mapDefinition } from "./definition";
import { MapRepository } from "./repository";

export async function mapController(maps: MapRepository) {
  return createRpcController(mapDefinition.entries, {
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
    async updateMapInfo(mapInfoAsLuaCode) {
      return maps.updateInfo(mapInfoAsLuaCode).success;
    },
  });
}
