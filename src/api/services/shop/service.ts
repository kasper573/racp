import { createSearchProcedure, noLimitForFilter } from "../../common/search";
import { t } from "../../trpc";
import { shopFilter, shopItemFilter, shopItemType, shopType } from "./types";
import { ShopRepository } from "./repository";

export type ShopService = ReturnType<typeof createShopService>;

export function createShopService(shops: ShopRepository) {
  return t.router({
    search: createSearchProcedure(
      shopType,
      shopFilter.type,
      shops.getShops,
      (entity, payload) => shopFilter.for(payload)(entity)
    ),
    searchItems: createSearchProcedure(
      shopItemType,
      shopItemFilter.type,
      shops.getShopItems,
      (entity, payload) => shopItemFilter.for(payload)(entity),
      noLimitForFilter((filter) => filter?.id?.matcher === "=")
    ),
  });
}
