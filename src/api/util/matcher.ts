import { without } from "lodash";
import * as zod from "zod";
import { createZodMatcher } from "../../lib/zod/ZodMatcher";

export type ToggleName = zod.infer<typeof toggleNameType>;
export const toggleNameType = zod.string();

export type ToggleRecord = zod.infer<typeof toggleRecordType>;
export const toggleRecordType = zod
  .record(toggleNameType, zod.boolean())
  .default({});

export function resolveToggles(record: ToggleRecord = {}): ToggleName[] {
  return Object.entries(record).reduce(
    (names, [name, on]) => (on ? [...names, name] : names),
    [] as ToggleName[]
  );
}

const stringOptions = zod.object({ caseSensitive: zod.boolean() }).partial();

const normalizeString = (
  str: string,
  { caseSensitive = false }: zod.infer<typeof stringOptions> = {}
) => (caseSensitive ? str : str.toLowerCase());

const stringNormalizer =
  (fn: (a: string, b: string) => boolean) =>
  (target: string, text: string, options?: zod.infer<typeof stringOptions>) =>
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
    (a, [min, max]) =>
      a === undefined ||
      (a >= (min ?? Number.MIN_VALUE) && a <= (max ?? Number.MAX_VALUE))
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
    "includesSome",
    zod.array(item),
    zod.array(item),
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
