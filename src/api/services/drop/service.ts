import { t } from "../../trpc";
import { createSearchProcedure } from "../../common/search";
import { itemDropFilter, itemDropType } from "./types";
import { DropRepository } from "./repository";

export type DropService = ReturnType<typeof createDropService>;

export function createDropService(drops: DropRepository) {
  return t.router({
    search: createSearchProcedure(
      itemDropType,
      itemDropFilter.type,
      drops.getDrops,
      (entity, payload) => itemDropFilter.for(payload)(entity)
    ),
  });
}
