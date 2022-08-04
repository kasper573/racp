import { YamlDriver } from "../../rathena/YamlDriver";
import { FileStore } from "../../../lib/createFileStore";
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
  const resolver = createItemResolver({ tradeScale });
  const map = new Map<number, Item>();
  const info: Record<string, ItemInfo> = {};

  function update({ items: newItems = map, info: newInfo = info }) {
    map.clear();
    for (const [key, item] of newItems.entries()) {
      item.Info = newInfo?.[item.Id];
      map.set(key, item);
      resolver.postProcess?.(item, map);
    }
  }

  const ready = yaml
    .resolve("db/item_db.yml", resolver)
    .then((items) => update({ items }));

  const infoEntry = fs.entry("itemInfo.lub", parseItemInfo, (info) =>
    update({ info })
  );

  return {
    ready,
    info,
    map,
    updateInfo: infoEntry.update,
  };
}
