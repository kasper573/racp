import * as zod from "zod";
import { Path } from "../../lib/zodPath";

export type SortDirection = zod.infer<typeof sortDirectionType>;
export const sortDirectionType = zod.union([
  zod.literal("ASC"),
  zod.literal("DESC"),
]);

export interface SearchQuery<T> {
  filter?: SearchFilter<T>;
  sort?: SearchSort<T>;
  offset?: number;
  limit?: number;
}

export type SearchFilter<T> = unknown[];

export interface SearchSort<T> {
  path: Path<T>;
  direction: SortDirection;
}

export interface SearchResult<T> {
  total: number;
  entities: T[];
  hasMore: boolean;
}
