import { createRpcController } from "../../../lib/rpc/createRpcController";
import { RpcException } from "../../../lib/rpc/RpcException";
import { createSearchController } from "../../common/search";
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
        throw new RpcException("A file must be uploaded");
      }
      const itemInfoAsLuaCode = Buffer.from(luaFile.data).toString("utf8");
      const { success } = items.updateInfo(itemInfoAsLuaCode);
      if (!success) {
        throw new RpcException("File could not be parsed as item info.");
      }
    },
  });
}
