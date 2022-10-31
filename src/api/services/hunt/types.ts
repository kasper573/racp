import * as zod from "zod";

export type HuntLimits = zod.infer<typeof huntLimitsType>;
export const huntLimitsType = zod.object({
  hunts: zod.number().int(),
  itemsPerHunt: zod.number().int(),
  monstersPerItem: zod.number().int(),
});
