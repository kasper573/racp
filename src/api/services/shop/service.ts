import { createSearchProcedure, noLimitForFilter } from "../../common/search";
import { t } from "../../trpc";
import { shopFilter, shopItemFilter, shopItemType, shopType } from "./types";
import { ShopRepository } from "./repository";

export type ShopService = ReturnType<typeof createShopService>;

export function createShopService({ shops, shopItems }: ShopRepository) {
  return t.router({
    search: createSearchProcedure(
      shopType,
      shopFilter.type,
      () => shops,
      (entity, payload) => shopFilter.for(payload)(entity),
      noLimitForFilter((filter) => filter?.mapId?.matcher === "equals")
    ),
    searchItems: createSearchProcedure(
      shopItemType,
      shopItemFilter.type,
      () => shopItems,
      (entity, payload) => shopItemFilter.for(payload)(entity),
      noLimitForFilter((filter) => filter?.id?.matcher === "=")
    ),
  });
}
