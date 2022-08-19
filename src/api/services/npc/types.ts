import * as zod from "zod";
import { zodNumeric } from "../../../lib/zod/zodNumeric";
import { mapIdType } from "../map/types";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";
import { matcher } from "../../util/matcher";
import { createSegmentedObject } from "../../../lib/zod/ZodSegmentedObject";

export type Warp = zod.infer<typeof warpType>;

export const warpType = createSegmentedObject({
  fromMap: mapIdType,
  fromX: zodNumeric(),
  fromY: zodNumeric(),
  facing: zodNumeric(),

  type: zod.union([zod.literal("warp"), zod.literal("warp2")]),

  name: zod.string(),

  spanX: zodNumeric(),
  spanY: zodNumeric(),
  toMap: mapIdType,
  toX: zodNumeric(),
  toY: zodNumeric(),
})
  .segment("fromMap", "fromX", "fromY", "facing")
  .segment("type")
  .segment("name")
  .segment("spanX", "spanY", "toMap", "toX", "toY")
  .build();

export type WarpFilter = zod.infer<typeof warpFilter.type>;
export const warpFilter = createEntityFilter(matcher, warpType);
