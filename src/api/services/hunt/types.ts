import * as zod from "zod";
import {
  huntedItemType,
  huntedMonsterType,
  huntType,
} from "../../../../prisma/zod";

export const huntNameType = zod.string().min(1).max(32);

export type HuntLimits = zod.infer<typeof huntLimitsType>;
export const huntLimitsType = zod.object({
  hunts: zod.number().int(),
  itemsPerHunt: zod.number().int(),
  monstersPerItem: zod.number().int(),
});

export type RichHunt = zod.infer<typeof richHuntType>;
export const richHuntType = huntType.and(
  zod.object({
    items: zod.array(huntedItemType),
    monsters: zod.array(huntedMonsterType),
  })
);
