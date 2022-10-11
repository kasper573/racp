import * as zod from "zod";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";
import { matcher } from "../../util/matcher";
import { ZodCustomObject } from "../../../lib/zod/ZodCustomObject";

export const npcType = new ZodCustomObject(
  {
    npcEntityId: zod.string(),
    map: zod.object({
      id: zod.string(),
      x: zod.number(),
      y: zod.number(),
    }),
    facing: zod.number(),
    type: zod.literal("script"),
    name: zod.string(),
    spriteId: zod.string(),
    trigger: zod
      .object({
        x: zod.number(),
        y: zod.number(),
      })
      .optional(),
    code: zod.string(),
  },
  (values: string[][]) => {
    const [
      [npcEntityId],
      [mapId, mapX, mapY, facing],
      [type],
      [name],
      [spriteId, ...tail],
    ] = values;

    if (type !== "script") {
      throw new Error(`Not an NPC object`);
    }

    let trigger: { x: number; y: number } | undefined;
    if (typeof tail[0] === "number" && tail[1] === "number") {
      const [x, y] = tail.splice(0, 2);
      trigger = { x: +x, y: +y };
    }

    const code = tail[0];

    return {
      npcEntityId,
      map: {
        id: mapId,
        x: +mapX,
        y: +mapY,
      },
      facing: +facing,
      type: type as "script",
      name,
      spriteId,
      trigger,
      code,
    };
  }
);

export type NpcFilter = zod.infer<typeof npcFilter.type>;
export const npcFilter = createEntityFilter(matcher, npcType);
