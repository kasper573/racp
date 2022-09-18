import * as fs from "fs";
import { YamlDriver } from "../../rathena/YamlDriver";
import { FileStore } from "../../../lib/createFileStore";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { createImageUpdater } from "../../common/createImageUpdater";
import { autoMapLinkerUrls, Linker } from "../../../lib/createPublicFileLinker";
import { ImageFormatter } from "../../../lib/createImageFormatter";
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
  const imageLinker = linker.chain("items");
  const imageName = (item: Item) =>
    `${item.Info?.identifiedResourceName}${formatter.fileExtension}`;
  const [imageUrlsPromise, imageWatcher] = autoMapLinkerUrls(imageLinker);

  const itemResolver = createItemResolver({ tradeScale });
  const itemsPromise = yaml.resolve("db/item_db.yml", itemResolver);
  const infoFile = files.entry("itemInfo.lub", parseItemInfo);

  async function getItems() {
    const plainItems = await itemsPromise;
    const imageUrls = await imageUrlsPromise;
    return Array.from(plainItems.values()).reduce(
      (map, item) =>
        map.set(item.Id, {
          ...item,
          Info: infoFile.data?.[item.Id],
          ImageUrl: imageUrls.get(imageName(item)),
        }),
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
      fs.promises.readdir(imageLinker.directory).then((dirs) => dirs.length),
    updateImages: createImageUpdater(formatter, imageLinker),
    missingImages: () =>
      getItems().then((map) =>
        Array.from(map.values()).filter((item) => item.ImageUrl === undefined)
      ),
    destroy: () => {
      infoFile.close();
      imageWatcher.close();
    },
  };
}

const parseItemInfo = (luaCode: string) =>
  parseLuaTableAs(luaCode, itemInfoType);
