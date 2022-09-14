import * as zod from "zod";
import { ZodType } from "zod";
import { UseElevatedStateProps } from "../useElevatedState";
import { OmitNever, Values, ZodMatcher, ZodMatcherPayload } from "./ZodMatcher";
import { useZodForm, ZodFormRegistration } from "./useZodForm";

export function useZodMatcherForm<
  M extends ZodMatcher,
  Schema extends ZodType<AnyEntityFilterPayload>
>(props: ZodMatcherFormOptions<M, Schema>) {
  type Entity = zod.infer<Schema>;
  const field = useZodForm(props);
  function createMatcherFieldProps<
    Key extends keyof Entity,
    MatcherName extends ValidMatchers<
      M,
      Exclude<Entity[Key], undefined>["value"]
    >
  >(
    key: Key,
    matcher: MatcherName,
    options?: zod.infer<M["entries"][MatcherName]["options"]>
  ) {
    type Argument = zod.infer<M["entries"][MatcherName]["argument"]>;
    const { value, onChange } = field(key) as unknown as ZodFormRegistration<
      ZodMatcherPayload<MatcherName, Argument> | undefined
    >;
    return {
      value: value?.value,
      onChange(value) {
        onChange(value === undefined ? undefined : { matcher, value, options });
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

type ValidMatchers<M extends ZodMatcher, Argument> = Values<
  OmitNever<{
    [MatcherName in keyof M["entries"]]-?: Argument extends zod.infer<
      M["entries"][MatcherName]["argument"]
    >
      ? MatcherName
      : never;
  }>
>;

type AnyEntityFilterPayload = Record<string, ZodMatcherPayload | undefined>;
