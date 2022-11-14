import * as zod from "zod";
import { itemIdType, itemType } from "../item/types";
import { monsterDropType, monsterIdType } from "../monster/types";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";
import { matcher } from "../../matcher";
import { createSearchTypes } from "../../common/search.types";

/**
 * View model used by the app. Not to be confused with MonsterDrop.
 */
export type ItemDrop = zod.infer<typeof itemDropType>;

export type ItemDropId = zod.infer<typeof itemDropIdType>;

export const itemDropIdType = zod.number();

export const itemDropType = zod.object({
  Id: itemDropIdType,
  ItemId: itemIdType,
  MonsterId: monsterIdType,
  ItemName: zod.string(),
  MonsterName: zod.string(),
  MonsterImageUrl: zod.string().optional(),
  ...itemType.pick({ Slots: true, ImageUrl: true }).shape,
  ...monsterDropType.omit({ Item: true }).shape,
});

export type ItemDropFilter = zod.infer<typeof itemDropFilter.type>;
export const itemDropFilter = createEntityFilter(matcher, itemDropType);

export const itemDropSearchTypes = createSearchTypes(
  itemDropType,
  itemDropFilter.type
);
