import * as zod from "zod";
import { AnyZodObject, ZodType, ZodTypeAny } from "zod";
import { typedKeys } from "../typedKeys";
import { isZodType } from "./isZodType";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ZodMatcherEntries = Record<string, ZodMatcherEntry<any, any>>;

export type EntriesForArgument<
  Entries extends ZodMatcherEntries,
  Argument
> = OmitNever<{
  [K in keyof Entries]: IsDefinedType<
    zod.infer<Entries[K]["argument"]>,
    Argument
  > extends true
    ? Entries[K]
    : never;
}>;

export type EntriesForTarget<
  Entries extends ZodMatcherEntries,
  Target
> = OmitNever<{
  [K in keyof Entries]: IsDefinedType<
    zod.infer<Entries[K]["target"]>,
    Target
  > extends true
    ? Entries[K]
    : never;
}>;

export interface ZodMatcherEntry<
  Target extends ZodType,
  Argument extends ZodType
> {
  target: Target;
  argument: Argument;
  fn: ZodMatcherFn<Target, Argument>;
}

export type ZodMatcherFn<Target extends ZodType, Argument extends ZodType> = (
  target: zod.infer<Target>,
  argument: zod.infer<Argument>
) => boolean;

export interface ZodMatchPayload<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MatcherName extends keyof any = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Argument = any
> {
  matcher: MatcherName;
  value: Argument;
}

export type ZodMatchPayloadForEntries<
  Entries extends ZodMatcherEntries,
  Keys extends keyof Entries = keyof Entries
> = {
  [K in Keys]: ZodMatchPayload<K, zod.infer<Entries[K]["argument"]>>;
};

export type ZodMatchPayloadUnion<Entries extends ZodMatcherEntries> = Values<
  ZodMatchPayloadForEntries<Entries>
>;

export class ZodMatcher<Entries extends ZodMatcherEntries = ZodMatcherEntries> {
  constructor(public entries: Entries) {}

  add<Name extends string, Target extends ZodType, Argument extends ZodType>(
    name: Name,
    target: Target,
    argument: Argument,
    fn: ZodMatcherFn<Target, Argument>
  ) {
    return new ZodMatcher({
      ...this.entries,
      [name]: {
        target,
        argument,
        fn,
      },
    } as Entries & Record<Name, ZodMatcherEntry<Target, Argument>>);
  }

  match<Name extends keyof Entries>(
    target: zod.infer<Entries[Name]["target"]>,
    argument: ZodMatchPayload<Name, zod.infer<Entries[Name]["argument"]>>
  ): boolean {
    const entry = this.entries[argument.matcher];
    return entry.fn(target, argument.value);
  }
}

export function createZodMatcher() {
  return new ZodMatcher({});
}

export function createPayloadTypeFor<
  Matcher extends ZodMatcher,
  Argument extends ZodType
>(matcher: Matcher, targetType: Argument) {
  type PayloadType = ZodType<
    ZodMatchPayloadUnion<
      EntriesForArgument<Matcher["entries"], zod.infer<Argument>>
    >
  >;

  const payloadTypes = Object.entries(matcher.entries)
    .filter(([, entry]) => isZodType(entry.target, targetType))
    .map(([name, entry]) =>
      zod.object({ matcher: zod.literal(name), value: entry.argument })
    );

  if (payloadTypes.length === 0) {
    throw new Error(
      `Matcher contains no entries matching given argument type ${targetType}`
    );
  }

  return payloadTypes.length === 1
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payloadTypes[0] as any as PayloadType)
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (zod.union(payloadTypes as any) as PayloadType);
}

export function createEntityFilter<
  Matcher extends ZodMatcher,
  EntityType extends AnyZodObject
>(matcher: Matcher, entityType: EntityType) {
  type Entity = zod.infer<EntityType>;
  type Payload = EntityFilterPayload<Matcher["entries"], Entity>;

  const type = zod
    .object(
      Object.entries(entityType.shape).reduce((shape, [key, type]) => {
        try {
          return {
            ...shape,
            [key]: createPayloadTypeFor(matcher, type as ZodTypeAny),
          };
        } catch {
          return shape;
        }
      }, {})
    )
    .partial() as ZodType<Payload>;

  return {
    for:
      (payload: Payload) =>
      (entity: Entity): boolean =>
        typedKeys(payload).every((key) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          matcher.match(entity[key], payload[key] as any)
        ),
    type,
  };
}

export type EntityFilterPayload<
  Entries extends ZodMatcherEntries,
  Entity
> = Partial<{
  [K in keyof Entity]: ZodMatchPayloadUnion<
    EntriesForTarget<Entries, Entity[K]>
  >;
}>;

type Values<T> = T[keyof T];

type IsDefinedType<A, B> = Exclude<A, undefined> extends Exclude<B, undefined>
  ? true
  : false;

type OmitNever<T> = Pick<
  T,
  Values<{
    [K in keyof T]: T[K] extends never ? never : K;
  }>
>;
