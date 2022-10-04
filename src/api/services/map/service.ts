import * as zod from "zod";
import { TRPCError } from "@trpc/server";
import { defined } from "../../../lib/std/defined";
import { createSearchProcedure, noLimitForFilter } from "../../common/search";
import { bufferToLuaCode } from "../../common/parseLuaTableAs";
import { t } from "../../trpc";
import { decodeRpcFileData, rpcFile } from "../../common/RpcFile";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
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
      mapInfoType,
      mapInfoFilter.type,
      async () => Array.from((await repo.getMaps()).values()),
      (entity, payload) => mapInfoFilter.for(payload)(entity)
    ),
    searchWarps: createSearchProcedure(
      warpType,
      warpFilter.type,
      () => repo.warps,
      (entity, payload) => warpFilter.for(payload)(entity),
      noLimitForFilter((filter) => filter?.fromMap?.matcher === "equals")
    ),
    read: t.procedure
      .input(mapIdType)
      .output(mapInfoType)
      .query(async ({ input: mapId }) => {
        const item = (await repo.getMaps()).get(mapId);
        if (!item) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Map not found" });
        }
        return item;
      }),
    countImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.number())
      .query(() => repo.countImages()),
    uploadImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(zod.array(rpcFile))
      .mutation(({ input }) => repo.updateImages(input)),
    countInfo: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.number())
      .query(async () => (await repo.getMaps()).size),
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
      .mutation(({ input }) => repo.updateBounds(input)),
    countBounds: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.number())
      .query(
        async () =>
          Array.from((await repo.getMaps()).values()).filter(
            (map) => !!map.bounds
          ).length
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
        const maps = Array.from((await repo.getMaps()).values());
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
