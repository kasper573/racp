import { get } from "lodash";
import { parseRegexString } from "../../../lib/zod/zodRegexString";
import {
  SearchFilterItem,
  SearchFilterOperator,
  SearchFilter,
  SearchQuery,
  SearchResult,
  SearchSort,
} from "./search.types";

export function createSearchHandler<T>(entities: T[]) {
  return async ({
    filter,
    sort,
    offset = 0,
    limit = 100,
  }: SearchQuery<T>): Promise<SearchResult<T>> => {
    const matches = filter
      ? entities.filter((entity) => isMatch(entity, filter))
      : entities.slice();

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

export function isMatch<T>(entity: T, filters: SearchFilter<T>): boolean {
  for (const filter of filters) {
    let match = false;
    (<K extends SearchFilterOperator>() => {
      const { field, operator, argument } = filter as SearchFilterItem<T, K>;
      const value = get(entity, field);
      const fn = searchFilterOperators[operator];
      match = fn(value, argument);
    })();
    if (!match) {
      return false;
    }
  }
  return true;
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

const searchFilterOperators = {
  eq: <T>(a: T, b: T) => a === b,
  ne: <T>(a: T, b: T) => a !== b,
  gt: <T>(a: T, b: T) => a > b,
  lt: <T>(a: T, b: T) => a < b,
  gte: <T>(a: T, b: T) => a >= b,
  lte: <T>(a: T, b: T) => a <= b,
  between: <T>(a: T, [x, y]: [T, T]) => a >= x && a <= y,
  oneOf: <T>(a: T, list: T[]) => list.includes(a),
  regexp: <T>(a: T, exp: string) =>
    parseRegexString(exp)?.test(`${a}`) ?? false,
};
