import { Logger } from "../../../lib/logger";
import { NpcDriver } from "../../rathena/NpcDriver";
import { Item, ItemId } from "../item/types";
import { createAsyncMemo } from "../../../lib/createMemo";
import { internalShopType, Shop, ShopItem } from "./types";

export type ShopRepository = ReturnType<typeof createShopRepository>;

export function createShopRepository({
  npc,
  logger,
  getItems,
}: {
  npc: NpcDriver;
  logger: Logger;
  getItems: () => Promise<Map<ItemId, Item>>;
}) {
  const internalShopsPromise = logger.track(
    npc.resolve(internalShopType),
    "npc.resolve",
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
        for (const { itemId, price } of internalShop.items) {
          const item = items.get(itemId);
          shopItems.push({
            id: itemId,
            name: item?.Name ?? "Unknown",
            imageUrl: item?.ImageUrl,
            price: price === -1 ? item?.Buy ?? 0 : price,
            shopId: internalShop.npcEntityId,
            shopName: internalShop.name,
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
