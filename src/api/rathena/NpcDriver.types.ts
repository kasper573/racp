import * as zod from "zod";
import { ZodArrayEntity } from "../../lib/zod/ZodArrayEntity";
import { zodNumeric } from "../../lib/zod/zodNumeric";

export type NpcMonster = zod.infer<typeof npcMonsterType>;
export const npcMonsterType = new ZodArrayEntity([
  {
    map: zod.string(),
    x: zodNumeric().optional(),
    y: zodNumeric().optional(),
    rx: zodNumeric().optional(),
    ry: zodNumeric().optional(),
  },
  {
    type: zod.union([zod.literal("monster"), zod.literal("boss_monster")]),
  },
  {
    name: zod.string(),
    level: zodNumeric().optional(),
  },
  {
    id: zod.string(),
    amount: zodNumeric(),
    delay: zodNumeric().optional(),
    delay2: zodNumeric().optional(),
    event: zodNumeric().optional(),
    size: zodNumeric().optional(),
    ai: zodNumeric().optional(),
  },
]);
