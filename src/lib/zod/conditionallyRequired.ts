import { get } from "lodash";
import * as zod from "zod";
import { ZodType } from "zod";
import { Path } from "./zodPath";

export function conditionallyRequired<T extends ZodType>(
  type: T,
  satisfiesCondition: (values: zod.infer<T>) => boolean,
  paths: Path<zod.infer<T>>[],
  message = "Required"
): T {
  let refined: ZodType = type;
  for (const path of paths) {
    refined = refined.refine(
      (target) =>
        satisfiesCondition(target) ? Boolean(get(target, path)) : true,
      {
        message,
        path: String(path).split("."),
      }
    );
  }
  return refined as T;
}
