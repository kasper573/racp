import * as zod from "zod";
import { createSegmentedObject } from "../../../lib/zod/ZodSegmentedObject";
import { zodNumeric } from "../../../lib/zod/zodNumeric";
import { matcher } from "../../matcher";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";
import { mapIdType } from "../map/types";
import { RawScriptEntity } from "../../rathena/ScriptRepository";
import { toggleRecordType } from "../../../lib/zod/zodToggle";
import { createSearchTypes } from "../../common/search.types";

/**
 * Raw rAthena monster drop information.
 * Mostly used internally and is not used by app.
 */
export type MonsterDrop = zod.infer<typeof monsterDropType>;
export const monsterDropType = zod.object({
  Item: zod.string(), // AegisName
  Rate: zod.number(),
  StealProtected: zod.boolean().optional(),
  RandomOptionGroup: zod.string().optional(),
  Index: zod.number().optional(),
});

export const monsterModesType = toggleRecordType;

export type MonsterPostProcess = zod.infer<typeof monsterPostProcessType>;
export const monsterPostProcessType = zod.object({
  Flee: zod.number(),
  Hit: zod.number(),
  Atk: zod.number(),
  MAtk: zod.number(),
  ImageUrl: zod.string().optional(), // Undefined means image is not present on the server
});

export type MonsterId = zod.infer<typeof monsterIdType>;
export const monsterIdType = zod.number();

export type Monster = zod.infer<typeof monsterType>;
export const monsterType = zod.object({
  Id: monsterIdType,
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
  Size: zod.string().optional(),
  Race: zod.string().optional(),
  RaceGroups: toggleRecordType,
  Element: zod.string().optional(),
  ElementLevel: zod.number().default(1),
  WalkSpeed: zod.number().optional(),
  AttackDelay: zod.number().default(0),
  AttackMotion: zod.number().default(0),
  DamageMotion: zod.number().default(0),
  DamageTaken: zod.number().default(100),
  Ai: zod.number().default(6),
  Class: zod.string().default("Normal"),
  Modes: monsterModesType,
  MvpDrops: zod.array(monsterDropType).default([]),
  Drops: zod.array(monsterDropType).default([]),
  ...monsterPostProcessType.partial().shape,
});

export type MonsterFilter = zod.infer<typeof monsterFilter.type>;
export const monsterFilter = createEntityFilter(matcher, monsterType);

export type MonsterSpawnId = MonsterSpawn["id"];
export type MonsterSpawn = zod.infer<typeof monsterSpawnType>;
export const monsterSpawnType = createSegmentedObject()
  .segment({ id: zod.string() })
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
    monsterId: zodNumeric(),
    amount: zodNumeric(),
    spawnDelay: zodNumeric().optional(),
    spawnWindow: zodNumeric().optional(),
    event: zod.string().optional(),
    size: zodNumeric().optional(),
    ai: zodNumeric().optional(),
    // The following are custom addons and not part of the rAthena data
    // The values are applied after loading the npc files
    imageUrl: zod.string().optional(),
  })
  .buildForInput((input: RawScriptEntity) => [
    [input.rawScriptEntityId],
    ...input.matrix,
  ]);

export type MonsterSpawnFilter = zod.infer<typeof monsterSpawnFilter.type>;
export const monsterSpawnFilter = createEntityFilter(matcher, monsterSpawnType);

export const mvpLifeStatusOptions = ["Alive", "Dead", "Spawning"] as const;
export type MvpLifeStatus = typeof mvpLifeStatusOptions[number];

export type MvpStatus = zod.infer<typeof mvpStatusType>;
export const mvpStatusType = zod.object({
  lifeStatus: zod.string(), // TODO should be ZodType<MvpLifeStatus>. Refactor after this is fixed: https://github.com/ksandin/racp/issues/111
  killedBy: zod.string().optional(),
  killedAt: zod.number().optional(), // Unit timestamp
});

export const createMvpId = (monster: Monster, spawn: MonsterSpawn) =>
  `${monster.Id}-${spawn.map}`;

export type Mvp = zod.infer<typeof mvpType>;
export const mvpId = zod.string();
export const mvpType = zod.object({
  id: mvpId,
  monsterId: monsterIdType,
  name: zod.string(),
  imageUrl: zod.string().optional(),
  mapId: mapIdType,
  mapName: zod.string(),
  ...mvpStatusType.partial().shape,
  ...monsterSpawnType.pick({ spawnDelay: true, spawnWindow: true }).partial()
    .shape,
});

export type MvpFilter = zod.infer<typeof mvpFilter.type>;
export const mvpFilter = createEntityFilter(matcher, mvpType);

function trimZero(value?: number) {
  return value === 0 ? undefined : value;
}

export const mvpSearchTypes = createSearchTypes(mvpType, mvpFilter.type);

export const monsterSearchTypes = createSearchTypes(
  monsterType,
  monsterFilter.type
);

export const spawnSearchTypes = createSearchTypes(
  monsterSpawnType,
  monsterSpawnFilter.type
);
