import { without } from "lodash";
import * as zod from "zod";
import { Knex } from "knex";
import { createZodMatcher } from "../lib/zod/ZodMatcher";
import { createKnexMatcher } from "../lib/createKnexMatcher";
import { toggleNameType, toggleRecordType } from "../lib/zod/zodToggle";

const stringOptions = zod.object({ caseSensitive: zod.boolean() }).partial();

const normalizeString = (
  str: string,
  { caseSensitive = false }: zod.infer<typeof stringOptions> = {}
) => (caseSensitive ? str : str.toLowerCase());

const stringNormalizer =
  (fn: (a: string, b: string) => boolean) =>
  (target = "", text = "", options?: zod.infer<typeof stringOptions>) =>
    fn(normalizeString(target, options), normalizeString(text, options));

const item = zod.any();

export const matcher = createZodMatcher()
  .add("=", zod.number(), zod.number(), zod.void(), (a, b) => a === b)
  .add(">", zod.number(), zod.number(), zod.void(), (a, b) => a > b)
  .add("<", zod.number(), zod.number(), zod.void(), (a, b) => a < b)
  .add(">=", zod.number(), zod.number(), zod.void(), (a, b) => a >= b)
  .add("<=", zod.number(), zod.number(), zod.void(), (a, b) => a <= b)
  .add(
    "between",
    zod.number().optional(),
    zod.tuple([zod.number().nullish(), zod.number().nullish()]),
    zod.void(),
    (a, [min, max]) => {
      if (min === undefined && max === undefined) {
        return true;
      }
      return (
        a !== undefined &&
        a >= (min ?? Number.MIN_VALUE) &&
        a <= (max ?? Number.MAX_VALUE)
      );
    }
  )
  .add(
    "oneOfN",
    zod.number(),
    zod.array(zod.number()),
    zod.void(),
    (item, list) => list.includes(item)
  )
  .add(
    "oneOf",
    zod.string(),
    zod.array(zod.string()),
    zod.void(),
    (item, list) => list.includes(item)
  )
  .add("includes", zod.array(item), item, zod.void(), (list, item) =>
    list.includes(item)
  )
  .add(
    "includesAll",
    zod.array(item),
    zod.array(item),
    zod.void(),
    (a, b) => without(b, ...a).length === 0
  )
  .add(
    "includesSomeString",
    zod.array(zod.string()),
    zod.array(zod.string()),
    zod.void(),
    (a, b) => without(b, ...a).length < b.length
  )
  .add(
    "enabled",
    toggleRecordType,
    zod.array(toggleNameType),
    zod.void(),
    (record, names) => {
      for (const flag of names) {
        if (!record[flag]) {
          return false;
        }
      }
      return true;
    }
  )
  .add(
    "equals",
    zod.string(),
    zod.string(),
    stringOptions,
    stringNormalizer((a, b) => a === b)
  )
  .add(
    "startsWith",
    zod.string(),
    zod.string(),
    stringOptions,
    stringNormalizer((a, b) => a.startsWith(b))
  )
  .add(
    "endsWith",
    zod.string(),
    zod.string(),
    stringOptions,
    stringNormalizer((a, b) => a.endsWith(b))
  )
  .add(
    "contains",
    zod.string(),
    zod.string(),
    stringOptions,
    stringNormalizer((a, b) => a.includes(b))
  )
  .add(
    "someItemContains",
    zod.array(zod.string()),
    zod.string(),
    stringOptions,
    (list, arg, options) => {
      list = list.map((item) => normalizeString(item, options));
      arg = normalizeString(arg, options);
      return list.some((item) => item.includes(arg));
    }
  )
  .add(
    "everyItemContains",
    zod.array(zod.string()),
    zod.string(),
    stringOptions,
    (list, arg, options) => {
      list = list.map((item) => normalizeString(item, options));
      arg = normalizeString(arg, options);
      return list.every((item) => item.includes(arg));
    }
  )
  .add(
    "someItemEquals",
    zod.array(zod.string()),
    zod.string(),
    stringOptions,
    (list, arg, options) => {
      list = list.map((item) => normalizeString(item, options));
      arg = normalizeString(arg, options);
      return list.includes(arg);
    }
  );

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
