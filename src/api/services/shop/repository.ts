import { Logger } from "../../../lib/logger";
import { ScriptDriver } from "../../rathena/ScriptDriver";
import { Item, ItemId } from "../item/types";
import { createAsyncMemo } from "../../../lib/createMemo";
import { internalShopType, Shop, ShopItem } from "./types";

export type ShopRepository = ReturnType<typeof createShopRepository>;

export function createShopRepository({
  script,
  logger,
  getItems,
}: {
  script: ScriptDriver;
  logger: Logger;
  getItems: () => Promise<Map<ItemId, Item>>;
}) {
  const internalShopsPromise = logger.track(
    script.resolve(internalShopType),
    "script.resolve",
    "shop"
  );

  const getShops = () =>
    internalShopsPromise.then((list) =>
      list.map(
        (internalShop): Shop => ({
          ...internalShop,
          itemIds: internalShop.items.map(({ itemId }) => itemId),
        })
      )
    );

  const getShopItems = createAsyncMemo(
    () => Promise.all([internalShopsPromise, getItems()]),
    (internalShops, items): ShopItem[] => {
      return internalShops.reduce((shopItems, internalShop) => {
        const shopMap =
          internalShop.mapId && internalShop.mapX && internalShop.mapY
            ? {
                id: internalShop.mapId,
                x: internalShop.mapX,
                y: internalShop.mapY,
              }
            : undefined;
        for (const { itemId, price } of internalShop.items) {
          const item = items.get(itemId);
          shopItems.push({
            id: itemId,
            name: item?.Name ?? "Unknown",
            imageUrl: item?.ImageUrl,
            price: price === -1 ? item?.Buy ?? 0 : price,
            shopId: internalShop.scriptId,
            shopName: internalShop.name,
            shopMap,
          });
        }
        return shopItems;
      }, [] as ShopItem[]);
    }
  );

  return {
    getShops,
    getShopItems,
  };
}
