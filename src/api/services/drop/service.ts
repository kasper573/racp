import * as zod from "zod";
import { t } from "../../trpc";
import { createSearchProcedure, noLimitForFilter } from "../../common/search";
import { dropRateGroupType } from "../../rathena/DropRatesRegistry.types";
import { itemDropFilter, itemDropSearchTypes } from "./types";
import { DropRepository } from "./repository";

export type DropService = ReturnType<typeof createDropService>;

export function createDropService({ drops, rates }: DropRepository) {
  return t.router({
    rates: t.procedure
      .output(zod.array(dropRateGroupType))
      .query(() => rates.then()),
    search: createSearchProcedure(
      itemDropSearchTypes,
      () => drops,
      (entity, payload) => itemDropFilter.for(payload)(entity),
      noLimitForFilter((filter) => filter?.ItemId?.matcher === "=")
    ),
  });
}
