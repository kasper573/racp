import * as zod from "zod";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";
import { matcher } from "../../util/matcher";
import { trimQuotes } from "../../../lib/trimQuotes";
import { ZodArrayEntity } from "../../../lib/zod/ZodArrayEntity";
import { zodNumeric } from "../../../lib/zod/zodNumeric";

export type MapId = zod.infer<typeof mapIdType>;
export const mapIdType = zod.string();

export type MapInfoPostProcess = zod.infer<typeof mapInfoPostProcessType>;
export const mapInfoPostProcessType = zod.object({
  id: mapIdType.default(""),
  imageUrl: zod.string().optional(),
});

export type MapInfo = zod.infer<typeof mapInfoType>;
export const mapInfoType = zod.object({
  displayName: zod.string().transform(trimQuotes),
  notifyEnter: zod.boolean().default(false),
  signName: zod
    .object({
      subTitle: zod.string().transform(trimQuotes),
      mainTitle: zod.string().transform(trimQuotes),
    })
    .partial()
    .default({}),
  backgroundBmp: zod.string().transform(trimQuotes).optional(),
  ...mapInfoPostProcessType.shape,
});

export type Warp = zod.infer<typeof warpType>;
export const warpType = new ZodArrayEntity([
  {
    fromMap: mapIdType,
    fromX: zodNumeric(),
    fromY: zodNumeric(),
    facing: zodNumeric(),
  },
  {
    type: zod.union([zod.literal("warp"), zod.literal("warp2")]),
  },
  {
    name: zod.string(),
  },
  {
    spanX: zodNumeric(),
    spanY: zodNumeric(),
    toMap: mapIdType,
    toX: zodNumeric(),
    toY: zodNumeric(),
  },
]);

export type MapInfoFilter = zod.infer<typeof mapInfoFilter.type>;
export const mapInfoFilter = createEntityFilter(matcher, mapInfoType);
