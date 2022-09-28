import * as zod from "zod";
import { TRPCError } from "@trpc/server";
import { defined } from "../../../lib/std/defined";
import { createSearchProcedure } from "../../common/search";
import { bufferToLuaCode } from "../../common/parseLuaTableAs";
import { t } from "../t";
import { rpcFile } from "../../common/RpcFile";
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
      async () => Array.from(repo.getMaps().values()),
      (entity, payload) => mapInfoFilter.for(payload)(entity)
    ),
    searchWarps: createSearchProcedure(
      warpType,
      warpFilter.type,
      () => repo.warps,
      (entity, payload) => warpFilter.for(payload)(entity)
    ),
    read: t.procedure
      .input(mapIdType)
      .output(mapInfoType)
      .query(({ input: mapId }) => {
        const item = repo.getMaps().get(mapId);
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
      .query(() => repo.getMaps().size),
    uploadInfo: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(rpcFile)
      .mutation(({ input: file }) => {
        const res = repo.updateInfo(bufferToLuaCode(Buffer.from(file.data)));
        if (!res.success) {
          throw new Error("File could not be parsed as map info.");
        }
        return Object.values(res.data ?? {}).map((map) => map.id);
      }),
    updateBounds: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(mapBoundsRegistryType)
      .mutation(({ input }) => repo.updateBounds(input)),
    countBounds: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.number())
      .query(
        () =>
          Array.from(repo.getMaps().values()).filter((map) => !!map.bounds)
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
      .query(() => {
        const maps = Array.from(repo.getMaps().values());
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
