import { createSearchProcedure, noLimitForFilter } from "../../common/search";
import { t } from "../../trpc";
import {
  shopFilter,
  shopItemFilter,
  shopItemSearchTypes,
  shopSearchTypes,
} from "./types";
import { ShopRepository } from "./repository";

export type ShopService = ReturnType<typeof createShopService>;

export function createShopService({ shops, shopItems }: ShopRepository) {
  return t.router({
    search: createSearchProcedure(
      shopSearchTypes,
      () => shops,
      (entity, payload) => shopFilter.for(payload)(entity),
      noLimitForFilter((filter) => filter?.mapId?.matcher === "equals")
    ),
    searchItems: createSearchProcedure(
      shopItemSearchTypes,
      () => shopItems,
      (entity, payload) => shopItemFilter.for(payload)(entity),
      noLimitForFilter((filter) => filter?.id?.matcher === "=")
    ),
  });
}
