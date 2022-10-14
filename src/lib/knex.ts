import { Knex } from "knex";

export async function count<T extends Knex.QueryBuilder>(
  query: T
): Promise<number> {
  const res = await clearRange(query.clone().clearSelect()).count().first();
  return res?.["count(*)"] ?? 0;
}

export function clearRange<T extends Knex.QueryBuilder>(query: T) {
  Object.assign((query as any)._single, {
    limit: undefined,
    offset: undefined,
  });
  return query;
}

export function some<T extends Knex.QueryBuilder>(query: T) {
  return count(query).then((n) => n > 0);
}
