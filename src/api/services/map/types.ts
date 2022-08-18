import * as zod from "zod";

export type MapInfo = zod.infer<typeof mapInfoType>;

export const mapInfoType = zod.object({
  displayName: zod.string(),
  notifyEnter: zod.boolean().default(false),
  signName: zod
    .object({
      subTitle: zod.string(),
      mainTitle: zod.string(),
    })
    .partial()
    .default({}),
  backgroundBmp: zod.string().optional(),
});
