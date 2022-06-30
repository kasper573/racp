import * as zod from "zod";
import { Path } from "../../lib/zodPath";
import { createSearchFilterType, sortDirectionType } from "./search.definition";

export type SortDirection = zod.infer<typeof sortDirectionType>;

export interface SearchQuery<T> {
  filter?: SearchFilters<T>;
  sort?: SearchSort<T>;
  offset?: number;
  limit?: number;
}

export type SearchFilters<T> = Array<SearchFilter<T>>;

export type AnySearchFilter = zod.infer<
  ReturnType<typeof createSearchFilterType>
>;

export type SearchFilterOperator = AnySearchFilter["operator"];

export type SearchFilter<
  T,
  K extends SearchFilterOperator = SearchFilterOperator
> = Omit<Extract<AnySearchFilter, { operator: K }>, "field"> & {
  field: Path<T>;
};

export type SearchSort<T> = Array<{
  field: Path<T>;
  sort: SortDirection;
}>;

export interface SearchResult<T> {
  total: number;
  entities: T[];
}
