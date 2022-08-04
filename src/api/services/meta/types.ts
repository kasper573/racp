import * as zod from "zod";

export const rangeType = zod.object({ min: zod.number(), max: zod.number() });

export const metaType = zod.object({
  monsterLevels: rangeType,
  monsterAttackRanges: rangeType,
  monsterSkillRanges: rangeType,
  monsterChaseRanges: rangeType,
  monsterWalkSpeeds: rangeType,
  monsterModes: zod.array(zod.string()),
  sizes: zod.array(zod.string()),
  maxSlots: zod.number(),
  genders: zod.array(zod.string()),
  classes: zod.array(zod.string()),
  jobs: zod.array(zod.string()),
  locations: zod.array(zod.string()),
  types: zod.record(zod.string(), zod.array(zod.string())),
  elements: zod.array(zod.string()),
  statuses: zod.array(zod.string()),
  races: zod.array(zod.string()),
});
