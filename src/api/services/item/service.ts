import * as zod from "zod";
import { TRPCError } from "@trpc/server";
import { createSearchProcedure } from "../../common/search";
import { bufferToLuaCode } from "../../common/parseLuaTableAs";
import { t } from "../t";
import { rpcFile } from "../../../lib/rpc/RpcFile";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { itemFilter, itemIdType, itemType } from "./types";
import { ItemRepository } from "./repository";

export type ItemService = ReturnType<typeof createItemService>;

export function createItemService(repo: ItemRepository) {
  return t.router({
    searchItems: createSearchProcedure(
      itemType,
      itemFilter.type,
      async () => Array.from((await repo.getItems()).values()),
      (entity, payload) => itemFilter.for(payload)(entity)
    ),
    getItem: t.procedure
      .input(itemIdType)
      .output(itemType)
      .query(async ({ input: itemId }) => {
        const map = await repo.getItems();
        const item = map.get(itemId);
        if (!item) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
        }
        return item;
      }),
    countItemInfo: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.number())
      .query(() => repo.countInfo()),
    uploadItemInfo: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(rpcFile)
      .mutation(async ({ input }) => {
        const itemInfoAsLuaCode = bufferToLuaCode(Buffer.from(input.data));
        const { success } = repo.updateInfo(itemInfoAsLuaCode);
        if (!success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "File could not be parsed as item info.",
          });
        }
        return repo.getResourceNames();
      }),
    countItemImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.number())
      .query(() => repo.countImages()),
    uploadItemImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(zod.array(rpcFile))
      .mutation(({ input }) => repo.updateImages(input)),
    getItemsMissingImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.array(itemType.shape["Id"]))
      .query(async () => {
        const itemsWithMissingImages = await repo.missingImages();
        return itemsWithMissingImages.map((m) => m.Id);
      }),
  });
}
