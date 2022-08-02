import * as zod from "zod";
import { AnyZodObject, ZodRawShape, ZodType, ZodTypeAny } from "zod";
import { typedKeys } from "../typedKeys";
import { isZodType } from "./isZodType";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ZodMatcherEntries = Record<string, ZodMatcherEntry<any, any, any>>;

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
  Argument extends ZodType,
  Options extends ZodType
> {
  target: Target;
  argument: Argument;
  options: Options;
  fn: ZodMatcherFn<Target, Argument, Options>;
}

export type ZodMatcherFn<
  Target extends ZodType,
  Argument extends ZodType,
  Options extends ZodType
> = (
  target: zod.infer<Target>,
  argument: zod.infer<Argument>,
  options?: zod.infer<Options>
) => boolean;

export interface ZodMatcherPayload<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MatcherName extends keyof any = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Argument = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Options = any
> {
  matcher: MatcherName;
  value: Argument;
  options?: Options;
}

export type ZodMatchPayloadForEntries<
  Entries extends ZodMatcherEntries,
  Keys extends keyof Entries = keyof Entries
> = {
  [K in Keys]: ZodMatcherPayload<K, zod.infer<Entries[K]["argument"]>>;
};

export type ZodMatchPayloadUnion<Entries extends ZodMatcherEntries> = Values<
  ZodMatchPayloadForEntries<Entries>
>;

export class ZodMatcher<Entries extends ZodMatcherEntries = ZodMatcherEntries> {
  constructor(public entries: Entries) {}

  add<
    Name extends string,
    Target extends ZodType,
    Argument extends ZodType,
    Options extends ZodType
  >(
    name: Name,
    target: Target,
    argument: Argument,
    options: Options,
    fn: ZodMatcherFn<Target, Argument, Options>
  ) {
    return new ZodMatcher<
      Entries & Record<Name, ZodMatcherEntry<Target, Argument, Options>>
    >({
      ...this.entries,
      [name]: {
        target,
        argument,
        fn,
        options: options.optional(),
      },
    });
  }

  match<Name extends keyof Entries>(
    target: zod.infer<Entries[Name]["target"]>,
    {
      matcher,
      value,
      options,
    }: ZodMatcherPayload<
      Name,
      zod.infer<Entries[Name]["argument"]>,
      zod.infer<Entries[Name]["options"]>
    >
  ): boolean {
    const { fn } = this.entries[matcher];
    return fn(target, value, options);
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
    .map(([name, entry]) => {
      const shape: ZodRawShape & ZodMatcherPayload = {
        matcher: zod.literal(name),
        value: entry.argument,
        options: entry.options,
      };
      return zod.object(shape);
    });

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

export type EntityFilterPayload<Entries extends ZodMatcherEntries, Entity> = {
  [K in keyof Entity]?: ZodMatchPayloadUnion<
    EntriesForTarget<Entries, Entity[K]>
  >;
};

type IsDefinedType<A, B> = Exclude<A, undefined> extends Exclude<B, undefined>
  ? true
  : false;

export type Values<T> = T[keyof T];

export type OmitNever<T> = Pick<
  T,
  Values<{
    [K in keyof T]: [T[K]] extends [never] ? never : K;
  }>
>;
