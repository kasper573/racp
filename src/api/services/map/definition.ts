import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { UserAccessLevel } from "../auth/types";

const tag = createTagFactory("Map");
const mapImagesTag = "MAP_IMAGES";
const mapInfoTag = "MAP_INFO";

export const mapDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query("countMapImages", zod.void(), zod.number(), {
        auth: UserAccessLevel.Admin,
        tags: [mapImagesTag],
      })
      .fileUpload(
        "uploadMapImages",
        zod.object({ success: zod.number(), failed: zod.number() }),
        { auth: UserAccessLevel.Admin, tags: [mapImagesTag] }
      )
      .query("countMapInfo", zod.void(), zod.number(), {
        auth: UserAccessLevel.Admin,
        tags: [mapInfoTag],
      })
      .mutation("updateMapInfo", zod.string(), zod.boolean(), {
        tags: [mapInfoTag],
        auth: UserAccessLevel.Admin,
        requestBodySizeLimit: 2 * Math.pow(10, 7),
      }),
});
