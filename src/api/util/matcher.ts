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

export function isToggleMatch(req?: ToggleName[], val?: ToggleRecord) {
  if (req === undefined) {
    return true;
  }
  if (val === undefined) {
    return req.length === 0;
  }
  for (const flag of req) {
    if (!val[flag]) {
      return false;
    }
  }
  return true;
}

export function isArrayMatch<T>(req?: T[], val?: T | T[]) {
  if (req === undefined) {
    return true;
  }
  if (val === undefined) {
    return req.length === 0;
  }
  if (Array.isArray(val)) {
    return without(req, ...val).length < req.length; // one of
  }
  return req.includes(val);
}

export function isRangeMatch(req?: [number, number], val = 0) {
  if (req === undefined) {
    return true;
  }
  const [min, max] = req;
  return val >= min && val <= max;
}

export function isStringMatch(filter?: string | StringFilter, val?: string) {
  if (typeof filter === "string") {
    filter = defaultStringFilter(filter);
  }
  if (filter === undefined || filter.arg === undefined) {
    return true;
  }
  if (val === undefined) {
    return filter.arg === "";
  }
  const a = filter.caseSensitive ? val : val.toLowerCase();
  const b = filter.caseSensitive ? filter.arg : filter.arg.toLowerCase();
  return stringMatchers[filter.matcher](a, b);
}

export function isRefMatch<T>(req?: T, val?: T) {
  if (req === undefined) {
    return true;
  }
  return req === val;
}

function defaultStringFilter(arg: string): StringFilter {
  return { caseSensitive: false, matcher: "includes", arg };
}

const stringMatchers: Record<StringMatcherName, StringMatcherFn> = {
  includes: (a, b) => a.includes(b),
  startsWith: (a, b) => a.startsWith(b),
  endsWith: (a, b) => a.endsWith(b),
  equals: (a, b) => a === b,
};

export type StringMatcherFn = (a: string, b: string) => boolean;

export type StringMatcherName = zod.infer<typeof stringMatcherType>;

export const stringMatcherType = zod.union([
  zod.literal("equals"),
  zod.literal("startsWith"),
  zod.literal("endsWith"),
  zod.literal("includes"),
]);

// TODO remove old string / matching stuff
export type StringFilter = zod.infer<typeof stringFilterType>;
export const stringFilterType = zod.object({
  arg: zod.string().optional(),
  matcher: stringMatcherType,
  caseSensitive: zod.boolean(),
});

const primitive = zod.union([zod.number(), zod.string(), zod.boolean()]);

const stringOptions = zod.object({ caseSensitive: zod.boolean() }).partial();
const stringNormalizer =
  (fn: (a: string, b: string) => boolean) =>
  (
    target: string,
    text: string,
    { caseSensitive = false }: zod.infer<typeof stringOptions> = {}
  ) =>
    caseSensitive
      ? fn(target, text)
      : fn(target.toLowerCase(), text.toLowerCase());

export const matcher = createZodMatcher()
  .add("=", zod.number(), zod.number(), zod.void(), (a, b) => a === b)
  .add(">", zod.number(), zod.number(), zod.void(), (a, b) => a > b)
  .add("<", zod.number(), zod.number(), zod.void(), (a, b) => a < b)
  .add(">=", zod.number(), zod.number(), zod.void(), (a, b) => a >= b)
  .add("<=", zod.number(), zod.number(), zod.void(), (a, b) => a <= b)
  .add(
    "between",
    zod.number(),
    zod.tuple([zod.number(), zod.number()]),
    zod.void(),
    (a, [min, max]) => a >= min && a <= max
  )
  .add("includes", zod.array(primitive), primitive, zod.void(), (list, item) =>
    list.includes(item)
  )
  .add(
    "includesAll",
    zod.array(primitive),
    zod.array(primitive),
    zod.void(),
    (a, b) => without(b, ...a).length === 0
  )
  .add(
    "includesSome",
    zod.array(primitive),
    zod.array(primitive),
    zod.void(),
    (a, b) => without(b, ...a).length < b.length
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
  );

export function stringTransform({
  value,
  onChange,
}: {
  value?: string | StringFilter;
  onChange: (value?: string | StringFilter) => void;
}) {
  return {
    value: typeof value === "string" ? value : value?.arg,
    onChange,
  };
}
