import * as zod from "zod";
import {
  CartInventoryEntity,
  InventoryEntity,
} from "../../rathena/DatabaseDriver.types";
import { itemOptionIdType } from "../item/types";

export type ItemOptionInstance = zod.infer<typeof itemOptionInstanceType>;

export const itemOptionInstanceType = zod.object({
  id: itemOptionIdType,
  value: zod.number(),
});

export type ItemInstanceProperties = zod.infer<
  typeof itemInstancePropertiesType
>;

export const itemInstancePropertiesType = zod.object({
  cardIds: zod.array(zod.number()),
  options: zod.array(itemOptionInstanceType),
  refine: zod.number(),
});

export function normalizeItemInstanceProperties(
  item: InventoryEntity | CartInventoryEntity
): ItemInstanceProperties {
  return {
    cardIds: [item.card0, item.card1, item.card2, item.card3].filter(Boolean),
    options: [
      { id: item.option_id0, value: item.option_val0 },
      { id: item.option_id1, value: item.option_val1 },
      { id: item.option_id2, value: item.option_val2 },
      { id: item.option_id3, value: item.option_val3 },
      { id: item.option_id4, value: item.option_val4 },
    ].filter(({ id }) => Boolean(id)),
    refine: item.refine,
  };
}
