import * as zod from "zod";
import { createSegmentedObject } from "../../../lib/zod/ZodSegmentedObject";
import { zodNumeric } from "../../../lib/zod/zodNumeric";
import { matcher, toggleRecordType } from "../../util/matcher";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";

export type MonsterSpawn = zod.infer<typeof monsterSpawnType>;
export const monsterSpawnType = createSegmentedObject({
  map: zod.string(),
  x: zodNumeric().optional(),
  y: zodNumeric().optional(),
  rx: zodNumeric().optional(),
  ry: zodNumeric().optional(),
  type: zod.union([zod.literal("monster"), zod.literal("boss_monster")]),
  name: zod.string(),
  level: zodNumeric().optional(),
  id: zod.string(),
  amount: zodNumeric(),
  delay: zodNumeric().optional(),
  delay2: zodNumeric().optional(),
  event: zod.string().optional(),
  size: zodNumeric().optional(),
  ai: zodNumeric().optional(),
})
  .segment("map", "x", "y", "rx", "ry")
  .segment("type")
  .segment("name", "level")
  .segment("id", "amount", "delay2", "event", "size", "ai")
  .build();

export type MonsterDrop = zod.infer<typeof monsterDropType>;
const monsterDropType = zod.object({
  Item: zod.string(),
  Rate: zod.number(),
  StealProtected: zod.boolean().optional(),
  RandomOptionGroup: zod.string().optional(),
  Index: zod.number().optional(),
});

export type Monster = zod.infer<typeof monsterType>;
export const monsterType = zod.object({
  Id: zod.number(),
  AegisName: zod.string(),
  Name: zod.string(),
  JapaneseName: zod.string().optional(),
  Level: zod.number().default(1),
  Hp: zod.number().default(1),
  Sp: zod.number().default(1),
  BaseExp: zod.number().default(0),
  JobExp: zod.number().default(0),
  MvpExp: zod.number().default(0),
  Attack: zod.number().default(0),
  Attack2: zod.number().default(0),
  Defense: zod.number().default(0),
  MagicDefense: zod.number().default(0),
  Resistance: zod.number().default(0),
  MagicResistance: zod.number().default(0),
  Str: zod.number().default(1),
  Agi: zod.number().default(1),
  Vit: zod.number().default(1),
  Int: zod.number().default(1),
  Dex: zod.number().default(1),
  Luk: zod.number().default(1),
  AttackRange: zod.number().default(0),
  SkillRange: zod.number().default(0),
  ChaseRange: zod.number().default(0),
  Size: zod.string(),
  Race: zod.string(),
  RaceGroups: toggleRecordType,
  Element: zod.string(),
  ElementLevel: zod.number().default(1),
  WalkSpeed: zod.number().optional(),
  AttackDelay: zod.number().default(0),
  AttackMotion: zod.number().default(0),
  DamageMotion: zod.number().default(0),
  DamageTaken: zod.number().default(100),
  Ai: zod.number().default(6),
  Class: zod.string().optional(),
  Modes: toggleRecordType,
  MvpDrops: zod.array(monsterDropType).default([]),
  Drops: zod.array(monsterDropType).default([]),
  // Post processed
  Flee: zod.number().optional(),
  Hit: zod.number().optional(),
  Atk: zod.number().optional(),
  MAtk: zod.number().optional(),
});

export type MonsterFilter = zod.infer<typeof monsterFilter.type>;

export const monsterFilter = createEntityFilter(matcher, monsterType);
