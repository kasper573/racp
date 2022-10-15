import * as zod from "zod";
import { YamlDriver } from "../../rathena/YamlDriver";
import { FileStore } from "../../../lib/fs/createFileStore";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { createImageRepository } from "../../common/createImageRepository";
import { Linker } from "../../../lib/fs/createPublicFileLinker";
import { ImageFormatter } from "../../../lib/image/createImageFormatter";
import { Logger } from "../../../lib/logger";
import { gfs } from "../../gfs";
import { createAsyncMemo } from "../../../lib/createMemo";
import { zodJsonProtocol } from "../../../lib/zod/zodJsonProtocol";
import { TxtDriver } from "../../rathena/TxtDriver";
import { defined } from "../../../lib/std/defined";
import { createItemResolver } from "./util/createItemResolver";
import {
  rawCashStoreItemType,
  Item,
  ItemId,
  itemInfoType,
  itemOptionTextsType,
} from "./types";

export type ItemRepository = ReturnType<typeof createItemRepository>;

export function createItemRepository({
  txt,
  yaml,
  files,
  tradeScale,
  linker,
  formatter,
  logger: parentLogger,
}: {
  txt: TxtDriver;
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

  const optionTextsFile = files.entry({
    relativeFilename: "itemOptionTexts.json",
    protocol: zodJsonProtocol(itemOptionTextsType),
  });

  const cashStoreItemsPromise = txt.resolve(
    "db",
    "item_cash_db.txt",
    rawCashStoreItemType
  );

  const itemResolver = createItemResolver({ tradeScale });
  const items = yaml.resolve("db/item_db.yml", itemResolver);

  const infoFile = files.entry({
    relativeFilename: "itemInfo.json",
    protocol: zodJsonProtocol(zod.record(itemInfoType)),
  });

  const getItems = createAsyncMemo(
    async () =>
      [
        await items.read(),
        await infoFile.read(),
        imageRepository.urlMap,
      ] as const,
    (plainItems, info, urlMap) => {
      logger.log("Recomputing item repository");
      return Array.from(plainItems.values()).reduce((map, item) => {
        const updatedItem: Item = {
          ...item,
          Info: info?.[item.Id],
          ImageUrl: urlMap[imageName(item)],
        };
        itemResolver.postProcess?.(updatedItem, map);
        return map.set(item.Id, updatedItem);
      }, new Map<ItemId, Item>());
    }
  );

  const getCashStoreItems = createAsyncMemo(
    () => Promise.all([cashStoreItemsPromise, getItems()]),
    (cashItems, items): Item[] =>
      defined(
        cashItems.map(({ itemId, price }) => {
          const item = items.get(itemId);
          return item ? { ...item, Buy: price } : undefined;
        })
      )
  );

  async function getResourceNames() {
    const info = await infoFile.read();
    return Object.entries(info ?? {}).reduce(
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
    getCashStoreItems,
    getOptionTexts: () => optionTextsFile.read().then((texts = {}) => texts),
    updateOptionTexts: optionTextsFile.assign,
    updateInfo(luaCode: string) {
      return infoFile.assign(parseLuaTableAs(luaCode, itemInfoType));
    },
    getResourceNames,
    countInfo: () =>
      infoFile.read().then((info = {}) => Object.keys(info).length),
    countImages: () =>
      gfs.readdir(imageLinker.directory).then((dirs) => dirs.length),
    updateImages: imageRepository.update,
    missingImages: () =>
      getItems().then((map) =>
        Array.from(map.values()).filter((item) => item.ImageUrl === undefined)
      ),
    destroy: () => {
      infoFile.dispose();
      imageRepository.close();
    },
  };
}
