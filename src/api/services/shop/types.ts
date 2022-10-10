import * as zod from "zod";
import { ZodObject } from "zod";
import { ZodCustomObject } from "../../../lib/zod/ZodCustomObject";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";
import { matcher } from "../../util/matcher";

export type ShopVariant = zod.infer<typeof shopVariantType>;
export const shopVariantType = zod.union([
  zod.literal("shop"),
  zod.literal("cashshop"),
  zod.literal("itemshop"),
  zod.literal("pointshop"),
  zod.literal("marketshop"),
]);

export const shopVariants = shopVariantType.options.map((v) => v.value);

export type ShopItem = zod.infer<typeof shopItemType>;
export const shopItemType = zod.object({
  itemId: zod.number(),
  price: zod.number(),
});

export type Shop = zod.infer<ZodObject<typeof shopTypeShape>>;
const shopTypeShape = {
  npcEntityId: zod.string(),
  variant: zod.string(), // TODO should be shopVariantType. Refactor after this is fixed: https://github.com/ksandin/racp/issues/111
  name: zod.string(),
  spriteId: zod.string(),
  discount: zod.boolean(),
  items: zod.array(shopItemType),
  mapId: zod.string().optional(),
  mapX: zod.number().optional(),
  mapY: zod.number().optional(),
  costItemId: zod.number().optional(),
  costVariable: zod.number().optional(),
};

export const shopType = new ZodCustomObject(
  shopTypeShape,
  (input: string[][]) => {
    const [[npcEntityId], map, [variant], [name], [spriteId, ...tail]] = input;

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
      };
    });

    return {
      mapId,
      mapX: mapX !== undefined ? +mapX : undefined,
      mapY: mapY !== undefined ? +mapY : undefined,
      npcEntityId,
      variant: variant as ShopVariant,
      name,
      spriteId,
      discount,
      items,
      costItemId,
      costVariable,
    };
  }
);

export type ShopFilter = zod.infer<typeof shopFilter.type>;
export const shopFilter = createEntityFilter(matcher, shopType);
