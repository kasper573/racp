import { YamlDriver } from "../../rathena/YamlDriver";
import { FileStore } from "../../../lib/createFileStore";
import { createAsyncRepository } from "../../../lib/createAsyncRepository";
import { Item, ItemInfo } from "./types";
import { createItemResolver } from "./util/createItemResolver";
import { parseItemInfo } from "./util/parseItemInfo";

export type ItemRepository = ReturnType<typeof createItemRepository>;

export function createItemRepository({
  yaml,
  fs,
  tradeScale,
}: {
  yaml: YamlDriver;
  fs: FileStore;
  tradeScale: number;
}) {
  let info: Record<string, ItemInfo> = {};
  const map = new Map<number, Item>();

  const resolver = createItemResolver({ tradeScale });

  const infoFile = fs.entry("itemInfo.lub", parseItemInfo, (info) =>
    update({ info })
  );

  function update({ items: newItems = map, info: newInfo = info }) {
    info = newInfo;
    map.clear();
    for (const [key, item] of newItems.entries()) {
      item.Info = info?.[item.Id];
      map.set(key, item);
      resolver.postProcess?.(item, map);
    }
  }

  return createAsyncRepository(
    () => yaml.resolve("db/item_db.yml", resolver),
    (items = new Map()) => {
      update({ items });
      return {
        info,
        map,
        updateInfo: infoFile.update,
      };
    }
  );
}
