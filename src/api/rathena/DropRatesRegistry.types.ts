import * as zod from "zod";

export type DropRateScales = zod.infer<typeof dropRateScalesType>;
export const dropRateScalesType = zod.object({
  all: zod.number(),
  bosses: zod.number(),
  mvps: zod.number(),
});

export type DropRateGroupName = zod.infer<typeof dropRateGroupNameType>;
export const dropRateGroupNameType = zod.enum([
  "mvp",
  "card",
  "equip",
  "use",
  "heal",
  "common",
]);

export type DropRateGroup = zod.infer<typeof dropRateGroupType>;
export const dropRateGroupType = zod.object({
  name: dropRateGroupNameType,
  scales: dropRateScalesType,
  min: zod.number(),
  max: zod.number(),
});
