import { matchEnumBits } from "../../../../lib/std/enum";

enum MonsterMode {
  CanMove = 0x0000001,
  Looter = 0x0000002,
  Aggressive = 0x0000004,
  Assist = 0x0000008,
  CastSensorIdle = 0x0000010,
  NoRandomWalk = 0x0000020,
  NoCast = 0x0000040,
  CanAttack = 0x0000080,
  CastSensorChase = 0x0000200,
  ChangeChase = 0x0000400,
  Angry = 0x0000800,
  ChangeTargetMelee = 0x0001000,
  ChangeTargetChase = 0x0002000,
  TargetWeak = 0x0004000,
  RandomTarget = 0x0008000,
  IgnoreMelee = 0x0010000,
  IgnoreMagic = 0x0020000,
  IgnoreRanged = 0x0040000,
  Mvp = 0x0080000,
  IgnoreMisc = 0x0100000,
  KnockBackImmune = 0x0200000,
  TeleportBlock = 0x0400000,
  FixedItemDrop = 0x1000000,
  Detector = 0x2000000,
  StatusImmune = 0x4000000,
  SkillImmune = 0x8000000,
}

const aegisClassToBits: Record<string, number> = {
  Normal: 0x0000000,
  Boss: 0x6200000,
  Guardian: 0x4000000,
  Battlefield: 0xc000000,
  Event: 0x1000000,
};

const aiCodeToBits: Record<number, number> = {
  1: 0x0081,
  2: 0x0083,
  3: 0x1089,
  4: 0x3885,
  5: 0x2085,
  6: 0x0000,
  7: 0x108b,
  8: 0x7085,
  9: 0x3095,
  10: 0x0084,
  11: 0x0084,
  12: 0x2085,
  13: 0x308d,
  17: 0x0091,
  19: 0x3095,
  20: 0x3295,
  21: 0x3695,
  24: 0x00a1,
  25: 0x0001,
  26: 0xb695,
  27: 0x8084,
};

export function resolveMonsterModes(aiCode: number, className: string) {
  return {
    ...matchEnumBits(MonsterMode, aegisClassToBits[className] ?? 0),
    ...matchEnumBits(MonsterMode, aiCodeToBits[aiCode] ?? 0),
  };
}
