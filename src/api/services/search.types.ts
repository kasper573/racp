import * as zod from "zod";
import { Path } from "../../lib/zodPath";

export type SortDirection = zod.infer<typeof sortDirectionType>;
export const sortDirectionType = zod.union([
  zod.literal("asc"),
  zod.literal("desc"),
]);

export interface SearchQuery<T> {
  filter?: SearchFilter<T>;
  sort?: SearchSort<T>;
  offset?: number;
  limit?: number;
}

export type SearchFilter<T> = unknown[];

export type SearchSort<T> = Array<{
  field: Path<T>;
  sort: SortDirection;
}>;

export interface SearchResult<T> {
  total: number;
  entities: T[];
}
