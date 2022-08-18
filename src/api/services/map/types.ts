import * as zod from "zod";

export type MapInfo = zod.infer<typeof mapInfoType>;

export const mapInfoType = zod.object({
  displayName: zod.string(),
  notifyEnter: zod.boolean(),
  signName: zod.object({
    subTitle: zod.string().optional(),
    mainTitle: zod.string(),
  }),
  backgroundBmp: zod.string(),
});
