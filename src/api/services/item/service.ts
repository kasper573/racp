import * as zod from "zod";
import { TRPCError } from "@trpc/server";
import { createSearchProcedure } from "../../common/search";
import { t } from "../../trpc";
import { decodeRpcFileData, rpcFile } from "../../common/RpcFile";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { bufferToLuaCode } from "../../common/parseLuaTableAs";
import { itemFilter, itemIdType, itemOptionTextsType, itemType } from "./types";
import { ItemRepository } from "./repository";

export type ItemService = ReturnType<typeof createItemService>;

export function createItemService(repo: ItemRepository) {
  return t.router({
    search: createSearchProcedure(
      itemType,
      itemFilter.type,
      async () => Array.from((await repo.items).values()),
      (entity, payload) => itemFilter.for(payload)(entity)
    ),
    read: t.procedure
      .input(itemIdType)
      .output(itemType)
      .query(async ({ input: itemId }) => {
        const map = await repo.items;
        const item = map.get(itemId);
        if (!item) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
        }
        return item;
      }),
    countInfo: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.number())
      .query(() => repo.infoCount.then()),
    uploadInfo: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(rpcFile)
      .mutation(async ({ input }) => {
        const itemInfoAsLuaCode = bufferToLuaCode(
          Buffer.from(decodeRpcFileData(input.data))
        );
        await repo.updateInfo(itemInfoAsLuaCode);
        return repo.resourceNames;
      }),
    resourceNames: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.record(zod.string()))
      .query(() => repo.resourceNames.then()),
    uploadOptionTexts: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(itemOptionTextsType)
      .mutation(({ input }) => repo.optionTexts.assign(input)),
    countImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.number())
      .query(() => repo.images.size()),
    uploadImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(zod.array(rpcFile))
      .mutation(({ input }) => repo.images.update(input)),
    missingImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.array(itemType.shape["Id"]))
      .query(async () => {
        const itemsWithMissingImages = await repo.missingImages;
        return itemsWithMissingImages.map((m) => m.Id);
      }),
    getOptionTexts: t.procedure
      .output(itemOptionTextsType)
      .query(() => repo.optionTexts.then((val) => val ?? {})),
  });
}
