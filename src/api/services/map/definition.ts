import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { UserAccessLevel } from "../auth/types";

const tag = createTagFactory("Map");
const mapCountTag = "MAP_COUNT";

export const mapDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query("countMapImages", zod.void(), zod.number(), {
        auth: UserAccessLevel.Admin,
        tags: [mapCountTag],
      })
      .fileUpload(
        "uploadMapImages",
        zod.object({ success: zod.number(), failed: zod.number() }),
        { auth: UserAccessLevel.Admin, tags: [mapCountTag] }
      ),
});
