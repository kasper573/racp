import * as zod from "zod";
import { AnyZodObject, ZodObject } from "zod";

export function zodPath<T extends AnyZodObject>(obj: T) {
  const rootShape = obj.shape;
  return zod.string().refine(
    (path) => {
      const steps = path.split(".");
      let shape = rootShape;
      for (const step of steps) {
        const next = shape[step];
        if (!next) {
          return false;
        }
        if (next instanceof ZodObject) {
          shape = next.shape;
        } else {
          break;
        }
      }
      return true;
    },
    {
      message: "String must be a possible path",
    }
  );
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
