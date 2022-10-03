import { Knex } from "knex";
import { createKnexMatcher } from "../../lib/createKnexMatcher";

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

export const knexMatcher = createKnexMatcher()
  .add("=", (query, column, value: number) => query.where(column, "=", value))
  .add(">", (query, column, value: number) => query.where(column, ">", value))
  .add("<", (query, column, value: number) => query.where(column, "<", value))
  .add(">=", (query, column, value: number) => query.where(column, ">=", value))
  .add("<=", (query, column, value: number) => query.where(column, "<=", value))
  .add(
    "between",
    (
      query,
      column,
      [min, max]: [number | null | undefined, number | null | undefined]
    ) => {
      if (min != null) {
        query = query.where(column, ">=", min);
      }
      if (max != null) {
        query = query.where(column, "<=", max);
      }
      return query;
    }
  )
  .add("oneOfN", noop)
  .add("oneOf", noop)
  .add("includes", noop)
  .add("includesAll", noop)
  .add("includesSomeString", noop)
  .add("enabled", noop)
  .add("equals", noop)
  .add("startsWith", noop)
  .add("endsWith", noop)
  .add("contains", (query, column, value: string) =>
    query.whereILike(column, `%${value}%`)
  )
  .add("someItemContains", noop)
  .add("everyItemContains", noop)
  .add("someItemEquals", noop)
  .add("is", noop);

function noop<T extends Knex.QueryBuilder>(
  query: T,
  value: any,
  options: any
): T {
  throw new Error("Not implemented");
}
