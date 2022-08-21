import * as zod from "zod";
import { zodNumeric } from "../../../lib/zod/zodNumeric";
import { mapIdType } from "../map/types";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";
import { matcher } from "../../util/matcher";
import { createSegmentedObject } from "../../../lib/zod/ZodSegmentedObject";

export type Warp = zod.infer<typeof warpType>;

export const warpType = createSegmentedObject()
  .segment({
    fromMap: mapIdType,
    fromX: zodNumeric(),
    fromY: zodNumeric(),
    facing: zodNumeric(),
  })
  .segment({
    type: zod.union([zod.literal("warp"), zod.literal("warp2")]),
  })
  .segment({
    name: zod.string(),
  })
  .segment({
    spanX: zodNumeric(),
    spanY: zodNumeric(),
    toMap: mapIdType,
    toX: zodNumeric(),
    toY: zodNumeric(),
  })
  .build();

export type WarpId = ReturnType<typeof createWarpId>;
export const createWarpId = (warp: Warp) => JSON.stringify(warp);

export type WarpFilter = zod.infer<typeof warpFilter.type>;
export const warpFilter = createEntityFilter(matcher, warpType);
