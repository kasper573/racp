import * as fs from "fs";
import { YamlDriver } from "../../rathena/YamlDriver";
import { FileStore } from "../../../lib/createFileStore";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { createImageUpdater } from "../../common/createImageUpdater";
import { Linker } from "../../../lib/createPublicFileLinker";
import { ImageFormatter } from "../../../lib/createImageFormatter";
import { fileExists } from "../../../lib/fileExists";
import { createItemResolver } from "./util/createItemResolver";
import { Item, ItemId, itemInfoType } from "./types";

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
  const itemImageName = (id: ItemId) => `${id}${formatter.fileExtension}`;
  const itemImageUrl = (id: ItemId) => itemLinker.url(itemImageName(id));
  const itemImagePath = (id: ItemId) => itemLinker.path(itemImageName(id));

  const itemResolver = createItemResolver({ tradeScale });
  const itemsPromise = yaml.resolve("db/item_db.yml", itemResolver);
  const infoFile = files.entry("itemInfo.lub", parseItemInfo);

  async function getItems() {
    const plainItems = await itemsPromise;
    const promises = Array.from(plainItems.values()).map(async (item) => ({
      ...item,
      Info: infoFile.data?.[item.Id],
      ImageUrl: (await fileExists(itemImagePath(item.Id)))
        ? itemImageUrl(item.Id)
        : undefined,
    }));

    const enrichedItems = await Promise.all(promises);
    return enrichedItems.reduce(
      (map, item) => map.set(item.Id, item),
      new Map<ItemId, Item>()
    );
  }

  function getResourceNames(): Record<ItemId, string> {
    return Object.entries(infoFile.data ?? {}).reduce(
      (resourceNames: Record<ItemId, string>, [id, info]) =>
        info.identifiedResourceName !== undefined
          ? {
              ...resourceNames,
              [id]: info.identifiedResourceName,
            }
          : resourceNames,
      {}
    );
  }

  return {
    getItems,
    updateInfo: infoFile.update,
    getResourceNames,
    countInfo: () => Object.keys(infoFile.data ?? {}).length,
    countImages: () =>
      fs.promises.readdir(itemLinker.directory).then((dirs) => dirs.length),
    updateImages: createImageUpdater(formatter, itemLinker),
    destroy: () => infoFile.close(),
  };
}

const parseItemInfo = (luaCode: string) =>
  parseLuaTableAs(luaCode, itemInfoType);
