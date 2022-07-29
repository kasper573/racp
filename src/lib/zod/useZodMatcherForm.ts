import * as zod from "zod";
import { ZodType } from "zod";
import { UseElevatedStateProps } from "../../app/hooks/useElevatedState";
import { OmitNever, Values, ZodMatcher, ZodMatcherPayload } from "./ZodMatcher";
import { useZodForm, ZodFormRegistration } from "./useZodForm";

export function useZodMatcherForm<
  M extends ZodMatcher,
  Schema extends ZodType<AnyEntityFilterPayload>
>(props: ZodMatcherFormOptions<M, Schema>) {
  type Entity = zod.infer<Schema>;
  const field = useZodForm(props);
  function createMatcherFieldProps<
    MatcherName extends keyof M["entries"],
    Key extends MatchingKeys<
      Entity,
      zod.infer<M["entries"][MatcherName]["target"]>
    >
  >(matcher: MatcherName, key: Key) {
    type Argument = zod.infer<M["entries"][MatcherName]["argument"]>;
    const { value, onChange } = field(key) as unknown as ZodFormRegistration<
      ZodMatcherPayload<MatcherName, Argument> | undefined
    >;
    return {
      value: value?.value,
      onChange(value) {
        onChange(value === undefined ? undefined : { matcher, value });
      },
    } as ZodFormRegistration<Argument | undefined>;
  }
  return createMatcherFieldProps;
}

export interface ZodMatcherFormOptions<
  Matcher extends ZodMatcher,
  Schema extends ZodType
> extends UseElevatedStateProps<zod.infer<Schema>> {
  matcher: Matcher;
  schema: Schema;
}

type MatcherTarget<
  Matcher extends ZodMatcher,
  MatcherName extends keyof Matcher["entries"]
> = zod.infer<Matcher["entries"][MatcherName]["target"]>;

type MatchingKeys<Entity extends AnyEntityFilterPayload, V> = Values<
  OmitNever<{
    [K in keyof Entity]-?: V extends Exclude<Entity[K], undefined>["value"]
      ? K
      : never;
  }>
>;

type AnyEntityFilterPayload = Record<string, ZodMatcherPayload | undefined>;
