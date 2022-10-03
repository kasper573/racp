import { Knex } from "knex";

export async function count<T extends Knex.QueryBuilder>(query: T) {
  const res = await query.clone().count().first();
  return res?.["count(*)"] ?? 0;
}

export function some<T extends Knex.QueryBuilder>(query: T) {
  return count(query).then((n) => n > 0);
}
