import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { UserAccessLevel } from "../auth/types";
import { createSearchTypes } from "../search/types";
import { mapIdType, mapInfoFilter, mapInfoType } from "./types";

const tag = createTagFactory("Map");
const mapImagesTag = "MAP_IMAGES";

export const mapDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query(
        "searchMaps",
        ...createSearchTypes(mapInfoType, mapInfoFilter.type),
        { tags: (res) => tag.many(res?.entities.map((map) => map.id)) }
      )
      .query("getMap", mapIdType, mapInfoType, {
        tags: (map) => [tag.one(map?.id)],
      })
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
        tags: tag.many(),
      })
      .fileUpload("uploadMapInfo", zod.array(mapIdType), {
        tags: tag.many(),
        auth: UserAccessLevel.Admin,
      }),
});
