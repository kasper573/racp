import * as zod from "zod";
import { ZodArrayEntity } from "../../../lib/zod/ZodArrayEntity";
import { zodNumeric } from "../../../lib/zod/zodNumeric";
import { stringFilterType } from "../../util/matchers";

export type MonsterFilter = zod.infer<typeof monsterFilterType>;
export const monsterFilterType = zod
  .object({
    name: zod.string().or(stringFilterType),
  })
  .partial();

export type MonsterSpawn = zod.infer<typeof monsterSpawnType>;
export const monsterSpawnType = new ZodArrayEntity([
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
    event: zod.string().optional(),
    size: zodNumeric().optional(),
    ai: zodNumeric().optional(),
  },
]);
