import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { UserAccessLevel } from "../user/types";
import { createSearchTypes } from "../../common/search";
import {
  mapBoundsRegistryType,
  mapIdType,
  mapInfoFilter,
  mapInfoType,
  warpFilter,
  warpType,
} from "./types";

const infoTag = createTagFactory("MapInfo");
const imageTag = createTagFactory("MapImage");
const boundsTag = createTagFactory("MapBounds");

export const mapDefinition = createRpcDefinition({
  tagTypes: [infoTag.type, imageTag.type],
  entries: (builder) =>
    builder
      .query(
        "searchMaps",
        ...createSearchTypes(mapInfoType, mapInfoFilter.type),
        { tags: (res) => infoTag.many(res?.entities.map((map) => map.id)) }
      )
      .query("searchWarps", ...createSearchTypes(warpType, warpFilter.type))
      .query("getMap", mapIdType, mapInfoType, {
        tags: (map) => [infoTag.one(map?.id)],
      })
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
      .fileUpload("uploadMapImages", zod.void(), {
        auth: UserAccessLevel.Admin,
        tags: imageTag.many(),
      })
      .query("countMapBounds", zod.void(), zod.number(), {
        auth: UserAccessLevel.Admin,
        tags: boundsTag.many(),
      })
      .mutation("updateMapBounds", mapBoundsRegistryType, zod.void(), {
        auth: UserAccessLevel.Admin,
        tags: (r, e, registry) => {
          const mapIds = Object.keys(registry);
          return [...boundsTag.many(mapIds), ...infoTag.many(mapIds)];
        },
      })
      .query(
        "getMissingMapData",
        zod.void(),
        zod.object({
          images: zod.array(mapIdType),
          bounds: zod.array(mapIdType),
        }),
        {
          tags: [...imageTag.many(), ...boundsTag.many()],
        }
      ),
});
