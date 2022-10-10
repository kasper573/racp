import { createSearchProcedure } from "../../common/search";
import { t } from "../../trpc";
import { NpcDriver } from "../../rathena/NpcDriver";
import { Logger } from "../../../lib/logger";
import { shopFilter, shopType } from "./types";

export type ShopService = ReturnType<typeof createShopService>;

export function createShopService({
  npc,
  logger,
}: {
  npc: NpcDriver;
  logger: Logger;
}) {
  const shopsPromise = logger.track(
    npc.resolve(shopType),
    "npc.resolve",
    "shop"
  );
  return t.router({
    search: createSearchProcedure(
      shopType,
      shopFilter.type,
      () => shopsPromise,
      (entity, payload) => shopFilter.for(payload)(entity)
    ),
  });
}
