import * as zod from "zod";
import { TxtDriver } from "../../rathena/TxtDriver";
import { Linker } from "../../../lib/fs/createPublicFileLinker";
import { ImageFormatter } from "../../../lib/image/createImageFormatter";
import { Logger } from "../../../lib/logger";
import { ImageUrlMap } from "../../common/ImageUrlMap";
import { zodJsonProtocol } from "../../../lib/zod/zodJsonProtocol";
import { defined } from "../../../lib/std/defined";
import { ResourceFactory } from "../../resources";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { createItemResolver } from "./util/createItemResolver";
import {
  Item,
  ItemId,
  itemInfoType,
  itemOptionTextsType,
  rawCashStoreItemType,
} from "./types";

export type ItemRepository = ReturnType<typeof createItemRepository>;

export function createItemRepository({
  txt,
  resources,
  tradeScale,
  linker,
  formatter,
  logger,
}: {
  txt: TxtDriver;
  resources: ResourceFactory;
  tradeScale: number;
  linker: Linker;
  formatter: ImageFormatter;
  logger: Logger;
}) {
  const imageLinker = linker.chain("items");
  const imageName = (item: Item) => `${item.Id}${formatter.fileExtension}`;
  const imageUrlMap = new ImageUrlMap({
    formatter,
    linker: imageLinker,
    logger,
  });

  const optionTexts = resources.file(
    "itemOptionTexts.json",
    zodJsonProtocol(itemOptionTextsType)
  );

  const cashItems = txt.resolve({
    startFolder: "db",
    relativeFilePath: "item_cash_db.txt",
    entityType: rawCashStoreItemType,
  });

  const itemResolver = createItemResolver({ tradeScale });
  const itemDB = resources.yaml("db/item_db.yml", itemResolver);

  const infoFile = resources.file(
    "itemInfo.json",
    zodJsonProtocol(zod.record(itemInfoType))
  );

  const items = itemDB
    .and(infoFile, imageUrlMap)
    .map(([itemDB, infoFile, imageUrlMap]) =>
      Array.from(itemDB.values()).reduce((map, item) => {
        const updatedItem: Item = {
          ...item,
          Info: infoFile?.[item.Id],
          ImageUrl: imageUrlMap[imageName(item)],
        };
        itemResolver.postProcess?.(updatedItem, map);
        return map.set(item.Id, updatedItem);
      }, new Map<ItemId, Item>())
    );

  const cashStoreItems = items
    .and(cashItems)
    .map(([items, cashItems]): Item[] =>
      defined(
        cashItems.map(({ itemId, price }) => {
          const item = items.get(itemId);
          return item ? { ...item, Buy: price } : undefined;
        })
      )
    );

  const resourceNames = infoFile.map((info = {}) =>
    Object.entries(info).reduce(
      (resourceNames: Record<string, string>, [id, info]) => {
        if (info.identifiedResourceName !== undefined) {
          resourceNames[id] = info.identifiedResourceName;
        }
        return resourceNames;
      },
      {}
    )
  );

  const missingImages = items.map((map) =>
    Array.from(map.values()).filter((item) => item.ImageUrl === undefined)
  );

  const infoCount = infoFile.map((info = {}) => Object.keys(info).length);

  return {
    items,
    updateInfo(luaCode: string) {
      return infoFile.assign(parseLuaTableAs(luaCode, itemInfoType));
    },
    cashStoreItems,
    resourceNames,
    optionTexts,
    imageUrlMap,
    missingImages,
    infoCount,
  };
}
