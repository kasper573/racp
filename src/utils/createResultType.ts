import * as zod from "zod";
import { ZodType } from "zod";

export function createResultType<T extends ZodType>(success: T) {
  const error = zod.object({ error: zod.string() });
  return zod.union([success, error]);
}