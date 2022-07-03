import { RAEntitySystem } from "../../../lib/rathena/RAEntitySystem";
import { createRpcController } from "../../../lib/rpc/createRpcController";
import { RpcException } from "../../../lib/rpc/RpcException";
import { createSearchController } from "../search/controller";
import { itemDefinition } from "./definition";
import { createItemResolver } from "./util/createItemResolver";
import { collectItemMeta } from "./util/collectItemMeta";
import { isMatchingItem } from "./util/isMatchingItem";

export function itemController({
  raes: { resolve },
  tradeScale,
}: {
  raes: RAEntitySystem;
  tradeScale: number;
}) {
  const items = resolve("db/item_db.yml", createItemResolver(tradeScale));
  const meta = collectItemMeta(Array.from(items.values()));

  return createRpcController(itemDefinition.entries, {
    async getItemMeta() {
      return meta;
    },
    searchItems: createSearchController(
      Array.from(items.values()),
      isMatchingItem
    ),
    async getItem(itemId) {
      const item = items.get(itemId);
      if (!item) {
        throw new RpcException("Invalid item id");
      }
      return item;
    },
  });
}
