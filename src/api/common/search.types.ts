import * as zod from "zod";
import { ZodType } from "zod";

export const sortDirectionType = zod.union([
  zod.literal("asc"),
  zod.literal("desc"),
]);

export type SortDirection = zod.infer<typeof sortDirectionType>;

export interface SearchQuery<T, F> {
  filter?: F;
  sort?: SearchSort<T>;
  offset?: number;
  limit?: number;
}

export type SearchSort<T> = Array<{
  field: keyof T;
  sort: SortDirection;
}>;

export interface SearchResult<T> {
  total: number;
  entities: T[];
}

export function createSearchTypes<ET extends ZodType, FT extends ZodType>(
  entityType: ET,
  filterType: FT
) {
  type Entity = zod.infer<ET>;
  type Filter = zod.infer<FT>;

  const sortType: ZodType<SearchSort<Entity>> = zod.array(
    zod.object({
      field: zod.string(),
      sort: sortDirectionType,
    })
  );

  const query: ZodType<SearchQuery<Entity, Filter>> = zod.object({
    filter: filterType.optional(),
    sort: sortType.optional(),
    offset: zod.number().optional(),
    limit: zod.number().optional(),
  });

  const result: ZodType<SearchResult<Entity>> = zod.object({
    total: zod.number(),
    entities: zod.array(entityType),
  });

  return { query, result };
}
