import * as zod from "zod";
import { createRpcDefinition } from "../../../lib/rpc/createRpcDefinition";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createSearchTypes } from "../search/search.types";
import {
  itemFilterType,
  itemIdType,
  itemMetaType,
  itemType,
} from "./item.types";

const tag = createTagFactory("Item");

export const itemDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query("getItemMeta", zod.void(), itemMetaType)
      .query("searchItems", ...createSearchTypes(itemType, itemFilterType))
      .query("getItem", itemIdType, itemType),
});
