import * as zod from "zod";
import { createSegmentedObject } from "../../../lib/zod/ZodSegmentedObject";
import { zodNumeric } from "../../../lib/zod/zodNumeric";
import { matcher, toggleRecordType } from "../../util/matcher";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";

export type MonsterDropPostProcess = zod.infer<
  typeof monsterDropPostProcessType
>;
export const monsterDropPostProcessType = zod.object({
  ItemId: zod.number().default(-1),
  Name: zod.string().default(""),
  Slots: zod.number().optional(),
});

export type MonsterDrop = zod.infer<typeof monsterDropType>;
const monsterDropType = zod.object({
  Item: zod.string(), // AegisName
  Rate: zod.number(),
  StealProtected: zod.boolean().optional(),
  RandomOptionGroup: zod.string().optional(),
  Index: zod.number().optional(),
  ...monsterDropPostProcessType.shape,
});

export type MonsterPostProcess = zod.infer<typeof monsterPostProcessType>;
export const monsterPostProcessType = zod.object({
  Flee: zod.number(),
  Hit: zod.number(),
  Atk: zod.number(),
  MAtk: zod.number(),
  ImageUrl: zod.string().optional(), // Undefined means image is not present on the server
  SpriteName: zod.string(),
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
  ...monsterPostProcessType.partial().shape,
});

export type MonsterFilter = zod.infer<typeof monsterFilter.type>;
export const monsterFilter = createEntityFilter(matcher, monsterType);

export type MonsterSpawnId = MonsterSpawn["npcEntityId"];
export type MonsterSpawn = zod.infer<typeof monsterSpawnType>;
export const monsterSpawnType = createSegmentedObject()
  .segment({ npcEntityId: zod.string() })
  .segment({
    map: zod.string(),
    x: zodNumeric().optional().transform(trimZero),
    y: zodNumeric().optional().transform(trimZero),
    width: zodNumeric().optional().transform(trimZero),
    height: zodNumeric().optional().transform(trimZero),
  })
  .segment({
    type: zod.union([zod.literal("monster"), zod.literal("boss_monster")]),
  })
  .segment({
    name: zod.string(),
    level: zodNumeric().optional(),
  })
  .segment({
    id: zodNumeric(),
    amount: zodNumeric(),
    spawnDelay: zodNumeric().optional(),
    spawnWindow: zodNumeric().optional(),
    event: zod.string().optional(),
    size: zodNumeric().optional(),
    ai: zodNumeric().optional(),
  })
  .build();

export type MonsterSpawnFilter = zod.infer<typeof monsterSpawnFilter.type>;
export const monsterSpawnFilter = createEntityFilter(matcher, monsterSpawnType);

function trimZero(value?: number) {
  return value === 0 ? undefined : value;
}
