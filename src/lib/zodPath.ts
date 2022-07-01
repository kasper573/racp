import * as zod from "zod";
import { AnyZodObject, ZodObject, ZodType } from "zod";

export function zodPath<Schema extends AnyZodObject>(obj: Schema) {
  return zod.string().refine((path) => pickZodType(obj, path) !== undefined, {
    message: "String must be a possible path",
  });
}

export function pickZodType<Schema extends AnyZodObject>(
  root: Schema,
  path: Path<zod.infer<Schema>>
): ZodType | undefined {
  const steps = String(path).split(".");
  let node: ZodType = root;
  for (const step of steps) {
    if (node instanceof ZodObject) {
      node = node.shape[step];
    } else {
      return;
    }
  }
  return node;
}

type PathImpl<T, Key extends keyof T> = Key extends string
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T[Key] extends Record<string, any>
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> &
            string}`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never;
type PathImpl2<T> = PathImpl<T, keyof T> | keyof T;

export type Path<T> = PathImpl2<T> extends string | keyof T
  ? PathImpl2<T>
  : keyof T;

export type PathValue<
  T,
  P extends Path<T>
> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends Path<T[Key]>
      ? PathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;
