import * as zod from "zod";
import { AnyZodObject, ZodObject, ZodType } from "zod";

export function zodPath<Schema extends AnyZodObject>(obj: Schema) {
  return zod.string().refine(
    (path) => {
      try {
        getZodType(obj, path);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: "String must be a possible path",
    }
  );
}

export function getZodType<
  Schema extends AnyZodObject,
  P extends Path<zod.infer<Schema>>
>(root: Schema, path: P) {
  const steps = String(path).split(".");
  let node: ZodType = root;
  for (const step of steps) {
    if (node instanceof ZodObject) {
      node = node.shape[step];
    } else {
      throw new Error(`Schema does not contain path "${String(path)}"`);
    }
  }
  return node as ZodType<PathValue<zod.infer<Schema>, P>>;
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
