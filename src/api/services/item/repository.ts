import { YamlDriver } from "../../rathena/YamlDriver";
import { FileStore } from "../../../lib/createFileStore";
import { createAsyncRepository } from "../../../lib/createAsyncRepository";
import { replaceMap, replaceObject } from "../../../lib/replaceEntries";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { Item, ItemInfo, itemInfoType } from "./types";
import { createItemResolver } from "./util/createItemResolver";

export type ItemRepository = ReturnType<typeof createItemRepository>;

export function createItemRepository({
  yaml,
  files,
  tradeScale,
}: {
  yaml: YamlDriver;
  files: FileStore;
  tradeScale: number;
}) {
  const info: Record<string, ItemInfo> = {};
  const map = new Map<number, Item>();

  const resolver = createItemResolver({ tradeScale });

  const infoFile = files.entry("itemInfo.lub", parseItemInfo, (newInfo) => {
    replaceObject(info, newInfo);
    rebuild();
  });

  function rebuild() {
    for (const [key, item] of map.entries()) {
      item.Info = info?.[item.Id];
      map.set(key, item);
      resolver.postProcess?.(item, map);
    }
  }

  return createAsyncRepository(
    () => yaml.resolve("db/item_db.yml", resolver),
    (items) => {
      replaceMap(map, items);
      rebuild();
      return {
        info,
        map,
        updateInfo: infoFile.update,
        destroy: () => infoFile.close(),
      };
    }
  );
}

const parseItemInfo = (luaCode: string) =>
  parseLuaTableAs(luaCode, itemInfoType);
