import { createRpcController } from "../../../lib/rpc/createRpcController";
import { RpcException } from "../../../lib/rpc/RpcException";
import { createSearchController } from "../search/controller";
import { itemDefinition } from "./definition";
import { itemFilter } from "./types";
import { ItemRepository } from "./repository";

export function itemController(items: ItemRepository) {
  return createRpcController(itemDefinition.entries, {
    searchItems: createSearchController(
      async () => {
        await items.ready;
        return Array.from(items.map.values());
      },
      (entity, payload) => itemFilter.for(payload)(entity)
    ),
    async getItem(itemId) {
      const item = items.map.get(itemId);
      if (!item) {
        throw new RpcException("Invalid item id");
      }
      return item;
    },
    async countItemInfo() {
      return Object.keys(items.info).length;
    },
    async uploadItemInfo([luaFile]) {
      if (!luaFile) {
        return false;
      }
      const itemInfoAsLuaCode = Buffer.from(luaFile.data).toString("utf8");
      return items.updateInfo(itemInfoAsLuaCode).success;
    },
  });
}
