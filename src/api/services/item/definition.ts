import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { UserAccessLevel } from "../user/types";
import { createSearchTypes } from "../../common/search";
import { itemFilter, itemIdType, itemType } from "./types";

const tag = createTagFactory("Item");

export const itemDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query("searchItems", ...createSearchTypes(itemType, itemFilter.type))
      .query("getItem", itemIdType, itemType)
      .query("countItemInfo", zod.void(), zod.number(), {
        tags: ["ITEM_INFO"],
        auth: UserAccessLevel.Admin,
      })
      .fileUpload("uploadItemInfo", zod.record(zod.string()), {
        tags: ["ITEM_INFO"],
        auth: UserAccessLevel.Admin,
      })
      .query("countItemImages", zod.void(), zod.number(), {
        tags: ["ITEM_IMAGES"],
        auth: UserAccessLevel.Admin,
      })
      .fileUpload("uploadItemImages", zod.void(), {
        tags: ["ITEM_IMAGES"],
        auth: UserAccessLevel.Admin,
      }),
});
