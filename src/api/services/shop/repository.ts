import { Item, ItemId } from "../item/types";
import { createAsyncMemo } from "../../../lib/createMemo";
import { ResourceFactory } from "../../resources";
import { Repository } from "../../../lib/repo/Repository";
import { internalShopType, Shop, ShopItem } from "./types";

export type ShopRepository = ReturnType<typeof createShopRepository>;

export function createShopRepository({
  resources,
  items,
}: {
  resources: ResourceFactory;
  items: Repository<Map<ItemId, Item>>;
}) {
  const internalShops = resources.script(internalShopType);

  const getShops = () =>
    internalShops.then((list) =>
      list.map(
        (internalShop): Shop => ({
          ...internalShop,
          itemIds: internalShop.items.map(({ itemId }) => itemId),
        })
      )
    );

  const getShopItems = createAsyncMemo(
    () => Promise.all([internalShops, items]),
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
            shopId: internalShop.id,
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
