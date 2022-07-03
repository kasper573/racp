import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createSearchTypes } from "../search/types";
import { createRpcDefinition } from "../../util/rpc";
import { itemFilterType, itemIdType, itemMetaType, itemType } from "./types";

const tag = createTagFactory("Item");

export const itemDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query("getItemMeta", zod.void(), itemMetaType)
      .query("searchItems", ...createSearchTypes(itemType, itemFilterType))
      .query("getItem", itemIdType, itemType),
});
