import * as zod from "zod";
import { ZodType } from "zod";

export function zodLiteralString<T extends string>() {
  return zod.string() as unknown as ZodType<T>;
}
