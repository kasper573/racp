import * as zod from "zod";
import { INVALID, ParseInput, ParseReturnType, ZodType } from "zod";

export function chainParse<T extends ZodType>(
  type: T,
  thisArg: unknown,
  input: ParseInput
): ParseReturnType<zod.infer<T>> {
  const res = type.safeParse.call(thisArg, input.data);
  return res.success ? { status: "valid", value: res.data } : INVALID;
}
