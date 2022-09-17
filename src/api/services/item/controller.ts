import { RpcException } from "../../../lib/rpc/RpcException";
import { createSearchController } from "../../common/search";
import { createRpcController } from "../../util/rpc";
import { itemDefinition } from "./definition";
import { itemFilter } from "./types";
import { ItemRepository } from "./repository";

export function itemController(repo: ItemRepository) {
  return createRpcController(itemDefinition.entries, {
    searchItems: createSearchController(
      async () => Array.from((await repo.getItems()).values()),
      (entity, payload) => itemFilter.for(payload)(entity)
    ),
    async getItem(itemId) {
      const map = await repo.getItems();
      const item = map.get(itemId);
      if (!item) {
        throw new RpcException("Invalid item id");
      }
      return item;
    },
    async countItemInfo() {
      return repo.countInfo();
    },
    async uploadItemInfo([luaFile]) {
      if (!luaFile) {
        throw new RpcException("A file must be uploaded");
      }
      const itemInfoAsLuaCode = Buffer.from(luaFile.data).toString("utf8");
      const { success } = repo.updateInfo(itemInfoAsLuaCode);
      if (!success) {
        throw new RpcException("File could not be parsed as item info.");
      }

      return repo.getResourceNames();
    },
    countItemImages: repo.countImages,
    uploadItemImages: repo.updateImages,
  });
}
