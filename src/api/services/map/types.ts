import * as zod from "zod";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";
import { matcher } from "../../util/matcher";
import { trimQuotes } from "../../../lib/std/trimQuotes";
import { createSegmentedObject } from "../../../lib/zod/ZodSegmentedObject";
import { zodNumeric } from "../../../lib/zod/zodNumeric";

export type MapId = zod.infer<typeof mapIdType>;
export const mapIdType = zod.string();

export type MapBounds = zod.infer<typeof mapBoundsType>;
export const mapBoundsType = zod.object({
  width: zod.number(),
  height: zod.number(),
});

export type MapInfoPostProcess = zod.infer<typeof mapInfoPostProcessType>;
export const mapInfoPostProcessType = zod.object({
  id: mapIdType.default(""),
  imageUrl: zod.string().optional(),
  bounds: mapBoundsType.optional(),
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

export type MapInfoFilter = zod.infer<typeof mapInfoFilter.type>;
export const mapInfoFilter = createEntityFilter(matcher, mapInfoType);

export type WarpId = Warp["npcEntityId"];
export type Warp = zod.infer<typeof warpType>;
export const warpType = createSegmentedObject()
  .segment({ npcEntityId: zod.string() })
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
    width: zodNumeric(),
    height: zodNumeric(),
    toMap: mapIdType,
    toX: zodNumeric(),
    toY: zodNumeric(),
  })
  .build();

export type WarpFilter = zod.infer<typeof warpFilter.type>;
export const warpFilter = createEntityFilter(matcher, warpType);

export type MapBoundsRegistry = zod.infer<typeof mapBoundsRegistryType>;
export const mapBoundsRegistryType = zod.record(mapIdType, mapBoundsType);
