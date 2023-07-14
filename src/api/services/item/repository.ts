import * as zod from "zod";
import { groupBy } from "lodash";
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
  rawCashStoreTabType,
} from "./types";

export type ItemRepository = ReturnType<typeof createItemRepository>;

export function createItemRepository({
  resources,
  tradeScale,
}: {
  resources: ResourceFactory;
  tradeScale: number;
}) {
  const images = resources.images("items");
  const imageName = (item: Item) => `${item.Id}${images.fileExtension}`;

  const optionTexts = resources.file({
    relativeFilename: "itemOptionTexts.json",
    protocol: zodJsonProtocol(itemOptionTextsType),
  });

  const cashStoreTabs = resources.yaml("db/item_cash.yml", {
    entityType: rawCashStoreTabType,
    getKey: (m) => m.Tab,
  });

  const itemResolver = createItemResolver({ tradeScale });
  const itemDB = resources.yaml("db/item_db.yml", itemResolver);

  const infoFile = resources.file({
    relativeFilename: "itemInfo.json",
    protocol: zodJsonProtocol(zod.record(itemInfoType)),
  });

  const items = itemDB
    .and(infoFile, images)
    .map("itemDB", ([itemDB, infoFile, imageUrlMap]) =>
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
    .and(cashStoreTabs)
    .map("cashStoreItems", ([items, cashStoreTabs]): Item[] => {
      const itemsByAegisName = groupBy(
        Array.from(items.values()),
        (item) => item.AegisName
      );
      return defined(
        Array.from(cashStoreTabs.values()).flatMap(({ Items }) =>
          Items.map(({ Item: aegisName, Price }) => {
            const item = itemsByAegisName[aegisName]?.[0];
            return item ? { ...item, Buy: Price } : undefined;
          })
        )
      );
    });

  const resourceNames = infoFile.map("resourceNames", (info = {}) =>
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

  const missingImages = items.map("missingImages", (map) =>
    Array.from(map.values()).filter((item) => item.ImageUrl === undefined)
  );

  const infoCount = infoFile.map(
    "infoCount",
    (info = {}) => Object.keys(info).length
  );

  return {
    items,
    updateInfo(luaCode: string) {
      return infoFile.assign(parseLuaTableAs(luaCode, itemInfoType));
    },
    cashStoreItems,
    resourceNames,
    optionTexts,
    images,
    missingImages,
    infoCount,
  };
}
