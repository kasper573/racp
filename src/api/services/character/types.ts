import * as zod from "zod";

export type Character = zod.infer<typeof characterType>;
export const characterType = zod.object({
  id: zod.number(),
  name: zod.string(),
  job: zod.string(),
  zeny: zod.number(),
  baseLevel: zod.number(),
  jobLevel: zod.number(),
});
