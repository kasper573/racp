import * as zod from "zod";
import { createRpcDefinition } from "../../lib/rpc/createRpcDefinition";
import { createTagFactory } from "../../lib/createTagFactory";

export const itemIdType = zod.number();

export type Item = zod.infer<typeof itemType>;
export const itemType = zod.object({
  Id: itemIdType,
  Name: zod.string(),
});

export const itemSearch = itemType;
export const itemBrief = itemType;

const tag = createTagFactory("Item");

export const itemDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query("searchItems", itemSearch, zod.array(itemBrief), {
        auth: false,
      })
      .query("getItem", itemIdType, itemType, {
        auth: false,
      }),
});
