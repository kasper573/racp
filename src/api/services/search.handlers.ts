import { SearchQuery, SearchResult } from "./search.types";

export function createSearchHandler<T>(entities: T[]) {
  return async ({
    offset = 0,
    limit = 100,
  }: SearchQuery<T>): Promise<SearchResult<T>> => {
    const matches = entities;
    const sliceEnd = offset + limit;
    const slice = entities.slice(offset, sliceEnd);
    return {
      entities: slice,
      total: 0,
      hasMore: sliceEnd < matches.length,
    };
  };
}
