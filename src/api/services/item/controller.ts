import { YamlDriver } from "../../rathena/YamlDriver";
import { createRpcController } from "../../../lib/rpc/createRpcController";
import { RpcException } from "../../../lib/rpc/RpcException";
import { createSearchController } from "../search/controller";
import { FileStore } from "../../../lib/createFileStore";
import { itemDefinition } from "./definition";
import { createItemResolver } from "./util/createItemResolver";
import { parseItemInfo } from "./util/parseItemInfo";
import { itemFilter } from "./types";

export async function itemController({
  yaml,
  fs,
  tradeScale,
}: {
  yaml: YamlDriver;
  fs: FileStore;
  tradeScale: number;
}) {
  const resolver = createItemResolver({ tradeScale });
  const items = await yaml.resolve("db/item_db.yml", resolver);

  let itemInfoCount = 0;
  const itemInfo = fs.entry("itemInfo.lub", parseItemInfo, (info) => {
    for (const item of items.values()) {
      item.Info = info?.[item.Id];
      resolver.postProcess?.(item, items);
    }
    itemInfoCount = info ? Object.keys(info).length : 0;
  });

  return createRpcController(itemDefinition.entries, {
    searchItems: createSearchController(
      Array.from(items.values()),
      (entity, payload) => itemFilter.for(payload)(entity)
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
