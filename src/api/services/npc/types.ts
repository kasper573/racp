import * as zod from "zod";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";
import { matcher } from "../../util/matcher";
import { ZodCustomObject } from "../../../lib/zod/ZodCustomObject";
import { RawScriptEntity, trimUniqueNpcName } from "../../rathena/ScriptDriver";

export type NpcId = Npc["scriptId"];
export type Npc = zod.infer<typeof npcType>;
export const npcType = new ZodCustomObject(
  {
    scriptId: zod.string(),
    mapId: zod.string(),
    mapX: zod.number(),
    mapY: zod.number(),
    facing: zod.number(),
    type: zod.literal("script"),
    name: zod.string(),
    spriteId: zod.string(),
    triggerX: zod.number().optional(),
    triggerY: zod.number().optional(),
    code: zod.string(),
  },
  ({ rawScriptEntityId, matrix }: RawScriptEntity) => {
    const [
      [mapId, mapXString, mapYString, facing],
      [type],
      [name],
      [spriteId, ...tail],
    ] = matrix;

    if (type !== "script") {
      throw new Error(`Not an NPC object`);
    }

    let triggerX: number | undefined;
    let triggerY: number | undefined;
    if (typeof tail[0] === "number" && tail[1] === "number") {
      const [x, y] = tail.splice(0, 2);
      triggerX = +x;
      triggerY = +y;
    }

    const code = tail[0];

    return {
      scriptId: rawScriptEntityId,
      mapId,
      mapX: +mapXString,
      mapY: +mapYString,
      facing: +facing,
      type: type as "script",
      name: trimUniqueNpcName(name),
      spriteId,
      triggerX,
      triggerY,
      code,
    };
  }
);

export type NpcFilter = zod.infer<typeof npcFilter.type>;
export const npcFilter = createEntityFilter(matcher, npcType);
