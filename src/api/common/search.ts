import * as zod from "zod";
import { ZodType } from "zod";
import { clamp, get } from "lodash";
import { Path, zodPath } from "../../lib/zod/zodPath";
import { t } from "../trpc";

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
  field: Path<T>;
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

  const pathType = zodPath(entityType);

  const sortType: ZodType<SearchSort<Entity>> = zod.array(
    zod.object({
      field: pathType,
      sort: sortDirectionType,
    })
  );

  const queryType: ZodType<SearchQuery<Entity, Filter>> = zod.object({
    filter: filterType.optional(),
    sort: sortType.optional(),
    offset: zod.number().optional(),
    limit: zod.number().optional(),
  });

  const resultType: ZodType<SearchResult<Entity>> = zod.object({
    total: zod.number(),
    entities: zod.array(entityType),
  });

  return { queryType, resultType };
}

// The default max limit is in place for when the client provides
// no limit and a search controller has no explicit limit.
// It's a safety measure to prevent the server from being overloaded.
const defaultMaxLimit = 50;

/**
 * Creates a max limit fn that unlocks the limit when the filter matches.
 * Using this will allow the client to retrieve all entities matching the filter.
 *
 * Important: This should only be used when the filter is trusted to produce a small result set.
 */
export const noLimitForFilter =
  <Filter>(isNoLimitFilter: (filter?: Filter) => boolean) =>
  (numMatches: number, filter?: Filter) =>
    isNoLimitFilter(filter) ? numMatches : undefined;

export function createSearchController<Entity, Filter>(
  getEntities: () => PromiseLike<Entity[]>,
  isMatch: (item: Entity, filter: Filter) => boolean,
  getMaxLimit?: (numMatches: number, filter?: Filter) => number | undefined
) {
  return async ({
    filter,
    sort,
    offset = 0,
    limit,
  }: SearchQuery<Entity, Filter>): Promise<SearchResult<Entity>> => {
    const entities = await getEntities();
    const matches = filter
      ? entities.filter((entity) => isMatch(entity, filter))
      : entities.slice();

    if (sort) {
      matches.sort(createCompareFn(sort));
    }

    limit = limit ?? matches.length;
    limit = clamp(
      limit,
      0,
      getMaxLimit?.(matches.length, filter) ?? defaultMaxLimit
    );
    offset = clamp(offset, 0, matches.length);
    const sliceEnd = offset + limit;
    const slice = matches.slice(offset, sliceEnd);
    return {
      entities: slice,
      total: matches.length,
    };
  };
}

export function createSearchProcedure<ET extends ZodType, FT extends ZodType>(
  entityType: ET,
  filterType: FT,
  getEntities: () => PromiseLike<zod.infer<ET>[]>,
  isMatch: (item: zod.infer<ET>, filter: zod.infer<FT>) => boolean,
  getMaxLimit?: (
    numMatches: number,
    filter?: zod.infer<FT>
  ) => number | undefined
) {
  const { queryType, resultType } = createSearchTypes(entityType, filterType);
  const search = createSearchController(getEntities, isMatch, getMaxLimit);
  return t.procedure
    .input(queryType)
    .output(resultType)
    .query(({ input }) => search(input));
}

function createCompareFn<T>(list: SearchSort<T>) {
  return (a: T, b: T): number => {
    for (const { field, sort } of list) {
      const multi = sort === "asc" ? 1 : -1;
      const aVal = get(a, field);
      const bVal = get(b, field);
      const diff = compareTo(aVal, bVal) * multi;
      if (diff !== 0) {
        return diff;
      }
    }
    return 0;
  };
}

function compareTo<T>(a?: T, b?: T): number {
  if (a === b) return 0;
  if (a === undefined) return -1;
  if (b === undefined) return 1;
  if (typeof a === "string" || typeof b === "string")
    return `${a}`.localeCompare(`${b}`);
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}
