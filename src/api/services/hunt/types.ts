import * as zod from "zod";
import { huntType } from "../../../../prisma/zod";
import { itemIdType } from "../item/types";
import { monsterIdType } from "../monster/types";

export type HuntLimits = zod.infer<typeof huntLimitsType>;
export const huntLimitsType = zod.object({
  hunts: zod.number().int(),
  itemsPerHunt: zod.number().int(),
  monstersPerItem: zod.number().int(),
});

export const richHuntType = huntType.and(
  zod.object({
    items: zod.array(itemIdType),
    monsters: zod.array(monsterIdType),
  })
);
