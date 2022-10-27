export type PathParams<Path extends string> = TransformOptionals<
  ExtractRawPathParams<Path>
>;

/**
 * Path string interpreter that does not take optional parameters into account.
 */
type ExtractRawPathParams<Path extends string> = string extends Path
  ? Record<string, string>
  : Path extends `${infer Start}:${infer Param}/${infer Rest}`
  ? { [k in Param | keyof ExtractRawPathParams<Rest>]: string }
  : Path extends `${infer Start}:${infer Param}`
  ? { [k in Param]: string }
  : {};

/**
 * Enhances the interpreter with support for optional properties
 */
type TransformOptionals<T> = {
  [Key in Optionals<T> as BaseName<Key & string>]?: T[Key] | undefined;
} & {
  [Key in Regulars<T>]: T[Key];
};

type Optionals<T> = ValueOf<{
  [Key in keyof T]: Key extends OptionalKey ? Key : never;
}>;

type Regulars<T> = Exclude<keyof T, Optionals<T>>;

type OptionalKey<Name extends string = string> = `${Name}?`;

type BaseName<Key extends string> = Key extends OptionalKey<infer K> ? K : Key;

type ValueOf<T> = T[keyof T];
