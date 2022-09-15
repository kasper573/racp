import { Knex } from "knex";

export async function some<T extends Knex.QueryBuilder>(query: T) {
  const res = await query.count().first();
  return (res?.["count(*)"] ?? 0) > 0;
}
