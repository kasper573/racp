import { createSearchProcedure, noLimitForFilter } from "../../common/search";
import { t } from "../../trpc";
import { createSearchTypes } from "../../common/search.types";
import { shopFilter, shopItemFilter, shopItemType, shopType } from "./types";
import { ShopRepository } from "./repository";

export type ShopService = ReturnType<typeof createShopService>;

export function createShopService({ shops, shopItems }: ShopRepository) {
  return t.router({
    search: createSearchProcedure(
      shopSearchTypes.query,
      shopSearchTypes.result,
      () => shops,
      (entity, payload) => shopFilter.for(payload)(entity),
      noLimitForFilter((filter) => filter?.mapId?.matcher === "equals")
    ),
    searchItems: createSearchProcedure(
      shopItemSearchTypes.query,
      shopItemSearchTypes.result,
      () => shopItems,
      (entity, payload) => shopItemFilter.for(payload)(entity),
      noLimitForFilter((filter) => filter?.id?.matcher === "=")
    ),
  });
}

const shopSearchTypes = createSearchTypes(shopType, shopFilter.type);
const shopItemSearchTypes = createSearchTypes(
  shopItemType,
  shopItemFilter.type
);
