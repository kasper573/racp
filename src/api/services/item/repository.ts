import * as fs from "fs";
import { YamlDriver } from "../../rathena/YamlDriver";
import { FileStore } from "../../../lib/fs/createFileStore";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { createImageRepository } from "../../common/createImageRepository";
import { Linker } from "../../../lib/fs/createPublicFileLinker";
import { ImageFormatter } from "../../../lib/image/createImageFormatter";
import { Logger } from "../../../lib/logger";
import { createItemResolver } from "./util/createItemResolver";
import { Item, ItemId, itemInfoType } from "./types";

export type ItemRepository = ReturnType<typeof createItemRepository>;

export function createItemRepository({
  yaml,
  files,
  tradeScale,
  linker,
  formatter,
  logger: parentLogger,
}: {
  yaml: YamlDriver;
  files: FileStore;
  tradeScale: number;
  linker: Linker;
  formatter: ImageFormatter;
  logger: Logger;
}) {
  const logger = parentLogger.chain("item");
  const imageLinker = linker.chain("items");
  const imageName = (item: Item) => `${item.Id}${formatter.fileExtension}`;
  const imageRepository = createImageRepository(formatter, imageLinker, logger);

  const itemResolver = createItemResolver({ tradeScale });
  const itemsPromise = yaml.resolve("db/item_db.yml", itemResolver);
  const infoFile = files.entry("itemInfo.lub", parseItemInfo);

  async function getItems() {
    const plainItems = await itemsPromise;
    return Array.from(plainItems.values()).reduce((map, item) => {
      const updatedItem: Item = {
        ...item,
        Info: infoFile.data?.[item.Id],
        ImageUrl: imageRepository.urlMap.get(imageName(item)),
      };
      itemResolver.postProcess?.(updatedItem, map);
      return map.set(item.Id, updatedItem);
    }, new Map<ItemId, Item>());
  }

  function getResourceNames() {
    return Object.entries(infoFile.data ?? {}).reduce(
      (resourceNames: Record<string, string>, [id, info]) => {
        if (info.identifiedResourceName !== undefined) {
          resourceNames[id] = info.identifiedResourceName;
        }
        return resourceNames;
      },
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
    updateImages: imageRepository.update,
    missingImages: () =>
      getItems().then((map) =>
        Array.from(map.values()).filter((item) => item.ImageUrl === undefined)
      ),
    destroy: () => {
      infoFile.close();
      imageRepository.close();
    },
  };
}

const parseItemInfo = (luaCode: string) =>
  parseLuaTableAs(luaCode, itemInfoType);
