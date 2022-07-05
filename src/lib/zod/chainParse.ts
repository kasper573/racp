import * as zod from "zod";
import {
  addIssueToContext,
  INVALID,
  ParseInput,
  ParseReturnType,
  ZodType,
} from "zod";

export function chainParse<T extends ZodType>(
  type: T,
  thisArg: ZodType,
  input: ParseInput
): ParseReturnType<zod.infer<T>> {
  const res = type.safeParse.call(thisArg, input.data);
  if (res.success) {
    return { status: "valid", value: res.data };
  }
  for (const issue of res.error.issues) {
    addIssueToContext(thisArg._getOrReturnCtx(input), issue);
  }
  return INVALID;
}
