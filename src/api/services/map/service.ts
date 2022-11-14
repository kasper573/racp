import * as zod from "zod";
import { TRPCError } from "@trpc/server";
import { defined } from "../../../lib/std/defined";
import { createSearchProcedure, noLimitForFilter } from "../../common/search";
import { bufferToLuaCode } from "../../common/parseLuaTableAs";
import { t } from "../../trpc";
import { decodeRpcFileData, rpcFile } from "../../common/RpcFile";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { createSearchTypes } from "../../common/search.types";
import { MapRepository } from "./repository";
import {
  mapBoundsRegistryType,
  mapIdType,
  mapInfoFilter,
  mapInfoType,
  warpFilter,
  warpType,
} from "./types";

export type MapService = ReturnType<typeof createMapService>;

export function createMapService(repo: MapRepository) {
  return t.router({
    search: createSearchProcedure(
      mapInfoSearchTypes.query,
      mapInfoSearchTypes.result,
      async () => Array.from((await repo.maps).values()),
      (entity, payload) => mapInfoFilter.for(payload)(entity)
    ),
    searchWarps: createSearchProcedure(
      warpSearchTypes.query,
      warpSearchTypes.result,
      () => repo.warps,
      (entity, payload) => warpFilter.for(payload)(entity),
      noLimitForFilter((filter) => filter?.fromMap?.matcher === "equals")
    ),
    read: t.procedure
      .input(mapIdType)
      .output(mapInfoType)
      .query(async ({ input: mapId }) => {
        const item = (await repo.maps).get(mapId);
        if (!item) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Map not found" });
        }
        return item;
      }),
    countImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.number())
      .query(() => repo.images.size()),
    uploadImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(zod.array(rpcFile))
      .mutation(({ input }) => repo.images.update(input)),
    countInfo: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.number())
      .query(() => repo.info.then((info) => Object.keys(info).length)),
    uploadInfo: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(rpcFile)
      .mutation(({ input: file }) => {
        const infoRecord = repo.updateInfo(
          bufferToLuaCode(Buffer.from(decodeRpcFileData(file.data)))
        );
        return infoRecord ? Object.values(infoRecord).map((map) => map.id) : [];
      }),
    updateBounds: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(mapBoundsRegistryType)
      .mutation(({ input }) => repo.bounds.assign(input)),
    countBounds: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.number())
      .query(
        async () =>
          Array.from((await repo.maps).values()).filter((map) => !!map.bounds)
            .length
      ),
    missingData: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(
        zod.object({
          images: zod.array(mapIdType),
          bounds: zod.array(mapIdType),
        })
      )
      .query(async () => {
        const maps = Array.from((await repo.maps).values());
        const images = defined(
          maps.map(({ id, imageUrl }) => (!imageUrl ? id : undefined))
        );
        const bounds = defined(
          maps.map(({ id, bounds }) => (!bounds ? id : undefined))
        );
        return { images, bounds };
      }),
  });
}

const mapInfoSearchTypes = createSearchTypes(mapInfoType, mapInfoFilter.type);
const warpSearchTypes = createSearchTypes(warpType, warpFilter.type);
