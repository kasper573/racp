import { RAES } from "../raes";
import { createRpcHandlers } from "../../lib/rpc/createRpcHandlers";
import { RpcException } from "../../lib/rpc/RpcException";
import { itemDefinition, itemType } from "./item.definition";

export function createItemHandlers(raes: RAES) {
  const items = raes.alloc("db/item_db.yml", itemType, (entity) => entity.Id);

  return createRpcHandlers(itemDefinition.entries, {
    async searchItems() {
      return Array.from(items.values()).slice(0, 100);
    },
    async getItem(itemId) {
      const item = items.get(itemId);
      if (!item) {
        throw new RpcException("Invalid item id");
      }
      return item;
    },
  });
}
