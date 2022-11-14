import * as zod from "zod";
import { toggleRecordType } from "../../../lib/zod/zodToggle";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";
import { matcher } from "../../matcher";
import { levelScaling } from "../../common/levelScaling";
import { createSearchTypes } from "../../common/search.types";

export type SkillId = zod.infer<typeof skillIdType>;
export const skillIdType = zod.number();

export type Skill = zod.infer<typeof skillType>;
export const skillType = zod.object({
  Id: skillIdType,
  Name: zod.string().default(""),
  DisplayName: zod.string().default(""), // Custom, not in rAthena data
  Description: zod.string().default(""),
  MaxLevel: zod.number().default(0),
  Type: zod.string().default("None"),
  TargetType: zod.string().default("Passive"),
  DamageFlags: toggleRecordType,
  Flags: toggleRecordType,
  Range: levelScaling("Size", zod.number()).default(0),
  Hit: zod.string().default("Normal"),
  HitCount: levelScaling("Count", zod.number()).default(0),
  Element: levelScaling("Element", zod.string()).default("Neutral"),
  SplashArea: levelScaling("Area", zod.number()).default(0),
  ActiveInstance: levelScaling("Max", zod.number()).default(0),
  Knockback: levelScaling("Amount", zod.number()).default(0),
  GiveAp: levelScaling("Amount", zod.number()).default(0),
  CopyFlags: zod
    .object({
      Skill: toggleRecordType,
      RemoveRequirement: toggleRecordType.optional(),
    })
    .optional(),
  NoNearNPC: zod
    .object({
      Type: toggleRecordType,
      AdditionalRange: zod.number().optional(),
    })
    .optional(),
  CastCancel: zod.boolean().default(false),
  CastDefenseReduction: zod.number().default(0),
  CastTime: levelScaling("Time", zod.number()).default(0),
  AfterCastActDelay: levelScaling("Time", zod.number()).default(0),
  AfterCastWalkDelay: levelScaling("Time", zod.number()).default(0),
  Duration1: levelScaling("Time", zod.number()).default(0),
  Duration2: levelScaling("Time", zod.number()).default(0),
  Cooldown: levelScaling("Time", zod.number()).default(0),
  FixedCastTime: levelScaling("Time", zod.number()).default(0),
  CastTimeFlags: toggleRecordType,
  CastDelayFlags: toggleRecordType,
  Requires: zod
    .object({
      HpCost: levelScaling("Amount", zod.number()).default(0),
      SpCost: levelScaling("Amount", zod.number()).default(0),
      ApCost: levelScaling("Amount", zod.number()).default(0),
      HpRateCost: levelScaling("Amount", zod.number()).default(0),
      SpRateCost: levelScaling("Amount", zod.number()).default(0),
      ApRateCost: levelScaling("Amount", zod.number()).default(0),
      MaxHpTrigger: levelScaling("Amount", zod.number()).default(0),
      ZenyCost: levelScaling("Amount", zod.number()).default(0),
      Weapon: toggleRecordType,
      Ammo: toggleRecordType,
      AmmoAmount: levelScaling("Amount", zod.number()).default(0),
      State: zod.string().default("None"),
      Status: toggleRecordType,
      SpiritSphereCost: levelScaling("Amount", zod.number()).default(0),
      ItemCost: levelScaling("Amount", zod.number(), {
        Item: zod.string(),
      }).default(0),
      Equipment: toggleRecordType,
    })
    .default({}),
  Unit: zod
    .object({
      Id: zod.string(),
      AlternateId: zod.string().optional(),
      Layout: levelScaling("Size", zod.number()).default(0),
      Range: levelScaling("Size", zod.number()).default(0),
      Interval: zod.number().default(0),
      Target: zod.string().default("All"),
      Flag: toggleRecordType,
    })
    .optional(),
  Status: zod.string().optional(),
});

export type SkillFilter = zod.infer<typeof skillFilter.type>;
export const skillFilter = createEntityFilter(matcher, skillType);
export const skillSearchTypes = createSearchTypes(skillType, skillFilter.type);
