import * as zod from "zod";
import { createRpcDefinition } from "../../lib/rpc/createRpcDefinition";
import { createTagFactory } from "../../lib/createTagFactory";
import {
  itemIdType,
  itemMetaType,
  itemSearchType,
  itemType,
} from "./item.types";

const tag = createTagFactory("Item");

export const itemDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query("getItemMeta", zod.void(), itemMetaType)
      .query("searchItems", itemSearchType, zod.array(itemType))
      .query("getItem", itemIdType, itemType),
});
