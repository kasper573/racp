import * as fs from "fs";
import { YamlDriver } from "../../rathena/YamlDriver";
import { FileStore } from "../../../lib/createFileStore";
import { createAsyncRepository } from "../../../lib/createAsyncRepository";
import { replaceMap, replaceObject } from "../../../lib/replaceEntries";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { createImageUpdater } from "../../common/createImageUpdater";
import { Linker } from "../../../lib/createPublicFileLinker";
import { ImageFormatter } from "../../../lib/createImageFormatter";
import { createItemResolver } from "./util/createItemResolver";
import { Item, ItemId, ItemInfo, itemInfoType } from "./types";

export type ItemRepository = ReturnType<typeof createItemRepository>;

export function createItemRepository({
  yaml,
  files,
  tradeScale,
  linker,
  formatter,
}: {
  yaml: YamlDriver;
  files: FileStore;
  tradeScale: number;
  linker: Linker;
  formatter: ImageFormatter;
}) {
  const itemLinker = linker.chain("items");
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

  function getResourceNames(): Record<ItemId, string> {
    return Array.from(map.values()).reduce(
      (resourceNames: Record<ItemId, string>, item) =>
        item.Info?.identifiedResourceName !== undefined
          ? {
              ...resourceNames,
              [item.Id]: item.Info.identifiedResourceName,
            }
          : resourceNames,
      {}
    );
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
        getResourceNames,
        countImages: () =>
          fs.promises.readdir(itemLinker.directory).then((dirs) => dirs.length),
        updateImages: createImageUpdater(formatter, itemLinker),
        destroy: () => infoFile.close(),
      };
    }
  );
}

const parseItemInfo = (luaCode: string) =>
  parseLuaTableAs(luaCode, itemInfoType);
