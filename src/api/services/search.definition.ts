import * as zod from "zod";
import { AnyZodObject, ZodType } from "zod";
import { zodPath } from "../../lib/zodPath";
import {
  SearchFilter,
  SearchQuery,
  SearchResult,
  SearchSort,
  sortDirectionType,
} from "./search.types";

export function createSearchTypes<T extends AnyZodObject>(entityType: T) {
  type Entity = zod.infer<T>;
  const filterType: ZodType<SearchFilter<Entity>> = zod.array(zod.unknown());

  const sortType: ZodType<SearchSort<Entity>> = zod.object({
    path: zodPath(entityType),
    direction: sortDirectionType,
  });

  const queryType: ZodType<SearchQuery<Entity>> = zod.object({
    filter: filterType.optional(),
    sort: sortType.optional(),
    offset: zod.number().optional(),
    limit: zod.number().optional(),
  });

  const resultType: ZodType<SearchResult<Entity>> = zod.object({
    total: zod.number(),
    entities: zod.array(entityType),
    hasMore: zod.boolean(),
  });

  return [queryType, resultType] as const;
}
