import { RAEntitySystem } from "../../../lib/rathena/RAEntitySystem";
import { createRpcController } from "../../../lib/rpc/createRpcController";
import { RpcException } from "../../../lib/rpc/RpcException";
import { createSearchController } from "../search/controller";
import { FileStore } from "../../../lib/createFileStore";
import { itemDefinition } from "./definition";
import { createItemResolver } from "./util/createItemResolver";
import { collectItemMeta } from "./util/collectItemMeta";
import { isMatchingItem } from "./util/isMatchingItem";
import { parseItemInfo } from "./util/parseItemInfo";
import { ItemMeta } from "./types";

export function itemController({
  raes,
  fs,
  tradeScale,
}: {
  raes: RAEntitySystem;
  fs: FileStore;
  tradeScale: number;
}) {
  const items = raes.resolve(
    "db/item_db.yml",
    createItemResolver({ tradeScale })
  );

  let meta: ItemMeta;
  const info = fs.entry("itemInfo.lub", parseItemInfo, (info) => {
    for (const item of items.values()) {
      item.Info = info?.[item.Id];
    }
    meta = collectItemMeta(Array.from(items.values()));
  });

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
    async updateItemInfo(itemInfoAsLuaCode) {
      return info.update(itemInfoAsLuaCode).success;
    },
  });
}
