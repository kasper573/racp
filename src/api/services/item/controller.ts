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

  let itemMeta: ItemMeta;
  let itemInfoCount = 0;
  const itemInfo = fs.entry("itemInfo.lub", parseItemInfo, (info) => {
    for (const item of items.values()) {
      item.Info = info?.[item.Id];
    }
    itemInfoCount = info ? Object.keys(info).length : 0;
    itemMeta = collectItemMeta(Array.from(items.values()));
  });

  return createRpcController(itemDefinition.entries, {
    async getItemMeta() {
      return itemMeta;
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
    async countItemInfo() {
      return itemInfoCount;
    },
    async updateItemInfo(itemInfoAsLuaCode) {
      return itemInfo.update(itemInfoAsLuaCode).success;
    },
  });
}
