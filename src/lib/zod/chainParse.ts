import * as zod from "zod";
import { addIssueToContext, INVALID, ParseInput, ZodType } from "zod";
import { SyncParseReturnType } from "zod/lib/helpers/parseUtil";

export function chainParse<T extends ZodType>(
  type: T,
  thisArg: ZodType,
  input: ParseInput,
  data = input.data
): SyncParseReturnType<zod.infer<T>> {
  const res = type.safeParse.call(thisArg, data);
  if (res.success) {
    return { status: "valid", value: res.data };
  }
  for (const issue of res.error.issues) {
    addIssueToContext(thisArg._getOrReturnCtx(input), issue);
  }
  return INVALID;
}
