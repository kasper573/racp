import * as zod from "zod";
import { TRPCError } from "@trpc/server";
import { defined } from "../../../lib/std/defined";
import { createSearchProcedure } from "../../common/search";
import { bufferToLuaCode } from "../../common/parseLuaTableAs";
import { t } from "../t";
import { rpcFile } from "../../../lib/rpc/RpcFile";
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
    searchMaps: createSearchProcedure(
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
    getMap: t.procedure
      .input(mapIdType)
      .output(mapInfoType)
      .query(({ input: mapId }) => {
        const item = repo.getMaps().get(mapId);
        if (!item) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Map not found" });
        }
        return item;
      }),
    countMapImages: t.procedure
      .output(zod.number())
      .query(() => repo.countImages()),
    uploadMapImages: t.procedure
      .input(zod.array(rpcFile))
      .mutation(({ input }) => repo.updateImages(input)),
    countMapInfo: t.procedure
      .output(zod.number())
      .query(() => repo.getMaps().size),
    uploadMapInfo: t.procedure.input(rpcFile).mutation(({ input: file }) => {
      const res = repo.updateInfo(bufferToLuaCode(Buffer.from(file.data)));
      if (!res.success) {
        throw new Error("File could not be parsed as map info.");
      }
      return Object.values(res.data ?? {}).map((map) => map.id);
    }),
    updateMapBounds: t.procedure
      .input(mapBoundsRegistryType)
      .mutation(({ input }) => repo.updateBounds(input)),
    countMapBounds: t.procedure
      .output(zod.number())
      .query(
        () =>
          Array.from(repo.getMaps().values()).filter((map) => !!map.bounds)
            .length
      ),
    getMissingMapData: t.procedure
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
