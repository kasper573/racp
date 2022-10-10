import * as zod from "zod";
import { ZodCustomObject } from "../../../lib/zod/ZodCustomObject";

export const shopType = new ZodCustomObject(
  {
    npcEntityId: zod.string(),
    name: zod.string(),
    spriteId: zod.string(),
    discount: zod.boolean(),
    items: zod.array(
      zod.object({
        itemId: zod.number(),
        price: zod.number(),
      })
    ),
  },
  (parts: string[][]) => {
    const [[dash], [type], [name], tail] = parts;
    if (dash !== "-" || type !== "shop") {
      throw new Error("Not a shop type");
    }
    const [spriteId, ...rest] = tail;
    let discount = false;
    if (["yes", "no"].includes(rest[0])) {
      discount = rest.shift() === "yes";
    }
    const items = rest.map((item) => {
      const [itemId, price] = item.split(":");
      return { itemId: +itemId, price: +price };
    });
    return { npcEntityId: "", name, spriteId, discount, items };
  }
);
