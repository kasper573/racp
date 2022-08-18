import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { UserAccessLevel } from "../auth/types";
import { createSearchTypes } from "../search/types";
import { mapIdType, mapInfoFilter, mapInfoType, warpType } from "./types";

const infoTag = createTagFactory("MapInfo");
const imageTag = createTagFactory("MapImage");

export const mapDefinition = createRpcDefinition({
  tagTypes: [infoTag.type],
  entries: (builder) =>
    builder
      .query(
        "searchMaps",
        ...createSearchTypes(mapInfoType, mapInfoFilter.type),
        { tags: (res) => infoTag.many(res?.entities.map((map) => map.id)) }
      )
      .query("getMap", mapIdType, mapInfoType, {
        tags: (map) => [infoTag.one(map?.id)],
      })
      .query("getMapWarps", mapIdType, zod.array(warpType))
      .query("countMapInfo", zod.void(), zod.number(), {
        auth: UserAccessLevel.Admin,
        tags: infoTag.many(),
      })
      .fileUpload("uploadMapInfo", zod.array(mapIdType), {
        tags: (ids) => infoTag.many(ids),
        auth: UserAccessLevel.Admin,
      })
      .query("countMapImages", zod.void(), zod.number(), {
        auth: UserAccessLevel.Admin,
        tags: imageTag.many(),
      })
      .fileUpload(
        "uploadMapImages",
        zod.object({ success: zod.number(), failed: zod.number() }),
        { auth: UserAccessLevel.Admin, tags: imageTag.many() }
      )
      .query("getMissingMapImages", zod.void(), zod.array(mapIdType), {
        tags: imageTag.many(),
      }),
});
