import * as zod from "zod";
import { ZodCustomObject } from "../../../lib/zod/ZodCustomObject";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";
import { matcher } from "../../util/matcher";
import { itemInstancePropertiesType } from "../inventory/types";
import { itemIdType } from "../item/types";
import { RawScriptEntity, trimUniqueNpcName } from "../../rathena/ScriptDriver";

export type ShopVariant = zod.infer<typeof shopVariantType>;
export const shopVariantType = zod.union([
  zod.literal("shop"),
  zod.literal("cashshop"),
  zod.literal("itemshop"),
  zod.literal("pointshop"),
  zod.literal("marketshop"),
]);

export const shopVariants = shopVariantType.options.map((v) => v.value);

export type ShopId = zod.infer<typeof shopIdType>;
export const shopIdType = zod.string();

export type InternalShop = zod.infer<typeof internalShopType>;
export const internalShopType = new ZodCustomObject(
  {
    scriptId: shopIdType,
    variant: zod.string(), // TODO should be shopVariantType. Refactor after this is fixed: https://github.com/ksandin/racp/issues/111
    name: zod.string(),
    spriteId: zod.string(),
    discount: zod.boolean(),
    items: zod.array(
      zod.object({
        itemId: itemIdType,
        price: zod.number(),
      })
    ),
    mapId: zod.string().optional(),
    mapX: zod.number().optional(),
    mapY: zod.number().optional(),
    costItemId: zod.number().optional(),
    costVariable: zod.number().optional(),
  },
  ({ scriptId, matrix }: RawScriptEntity) => {
    const [map, [variant], [name], [spriteId, ...tail]] = matrix;

    if (!shopVariants.includes(variant as ShopVariant)) {
      throw new Error(`Not a shop entry`);
    }

    const [mapId, mapX, mapY] =
      map[0] === "-" ? [undefined, undefined, undefined] : map;

    let discount = false;
    let costItemId: number | undefined;
    let costVariable: number | undefined;

    function readDiscount() {
      if (["yes", "no"].includes(tail[0])) {
        discount = tail.shift() === "yes";
      }
    }

    switch (variant as ShopVariant) {
      case "pointshop":
        costItemId = +tail.shift()!;
        readDiscount();
        break;
      case "itemshop": {
        costVariable = +tail.shift()!;
        readDiscount();
        break;
      }
      case "shop":
        readDiscount();
        break;
    }

    const items = tail.map((item) => {
      const [itemId, price, stock] = item.split(":");
      return {
        itemId: +itemId,
        price: +price,
        stock: stock !== undefined ? +stock : undefined,
        name: itemId,
      };
    });

    return {
      scriptId,
      mapId,
      mapX: mapX !== undefined ? +mapX : undefined,
      mapY: mapY !== undefined ? +mapY : undefined,
      variant: variant as ShopVariant,
      name: trimUniqueNpcName(name),
      spriteId,
      discount,
      items,
      costItemId,
      costVariable,
    };
  }
);

export type ShopItem = zod.infer<typeof shopItemType>;
export const shopItemType = zod.object({
  id: itemIdType,
  price: zod.number(),
  name: zod.string(),
  imageUrl: zod.string().optional(),
  shopId: shopIdType,
  shopName: zod.string(),
  shopMap: zod
    .object({
      id: zod.string(),
      x: zod.number(),
      y: zod.number(),
    })
    .optional(),
  ...itemInstancePropertiesType.partial().shape,
});

export type ShopItemFilter = zod.infer<typeof shopItemFilter.type>;
export const shopItemFilter = createEntityFilter(matcher, shopItemType);

export type Shop = zod.infer<typeof shopType>;
export const shopType = zod.object({
  itemIds: zod.array(itemIdType),
  ...internalShopType.omit({ items: true }).shape,
});

export type ShopFilter = zod.infer<typeof shopFilter.type>;
export const shopFilter = createEntityFilter(matcher, shopType);
