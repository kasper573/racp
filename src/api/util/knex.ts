import { Knex } from "knex";
import { SearchQuery, SearchResult, SearchSort } from "../common/search";

export async function count<T extends Knex.QueryBuilder>(query: T) {
  const res = await query.clone().clearSelect().count().first();
  return res?.["count(*)"] ?? 0;
}

export function some<T extends Knex.QueryBuilder>(query: T) {
  return count(query).then((n) => n > 0);
}

export function filter<T extends Knex.QueryBuilder, Filter>(
  builder: T,
  filter: Filter
) {
  return builder.clone();
}

export function sort<T extends Knex.QueryBuilder, Entity>(
  builder: T,
  sort: SearchSort<Entity>
) {
  return builder.clone();
}

export async function search<T extends Knex.QueryBuilder, Entity, Filter>(
  selectionQuery: T,
  query: SearchQuery<Entity, Filter>,
  parseEntity: (result: ValueOf<Awaited<T>>) => Entity
): Promise<SearchResult<Entity>> {
  let builder = selectionQuery.clone();
  if (query.filter) {
    builder = filter(builder, query.filter);
  }
  const countPromise = count(builder);
  if (query.sort) {
    builder = sort(builder, query.sort);
  }
  if (query.offset !== undefined) {
    builder = builder.offset(query.offset);
  }
  if (query.limit !== undefined) {
    builder = builder.limit(query.limit);
  }
  const [result, total] = await Promise.all([builder, countPromise]);
  return {
    total,
    entities: result.map(parseEntity),
  };
}

type ValueOf<T> = T extends ArrayLike<infer V> ? V : never;
