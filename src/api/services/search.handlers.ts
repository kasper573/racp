import { get } from "lodash";
import { SearchQuery, SearchResult, SearchSort } from "./search.types";

export function createSearchHandler<T>(entities: T[]) {
  return async ({
    sort,
    offset = 0,
    limit = 100,
  }: SearchQuery<T>): Promise<SearchResult<T>> => {
    const matches = entities.slice();
    if (sort) {
      matches.sort(createCompareFn(sort));
    }
    const sliceEnd = offset + limit;
    const slice = matches.slice(offset, sliceEnd);
    return {
      entities: slice,
      total: matches.length,
    };
  };
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
