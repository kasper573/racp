import * as zod from "zod";
import { ZodLiteral } from "zod";

export function zodRegexString() {
  return zod.string().refine((str) => regexStringWithFlags.test(str), {
    message: "Must be a regex string",
  }) as unknown as ZodLiteral<`/${string}/`>;
}

export function parseRegexString(str: string) {
  const match = regexStringWithFlags.exec(str);
  if (match) {
    const [, pattern, flags] = match;
    return new RegExp(pattern, flags);
  }
}

const regexStringWithFlags = /\/(.+)\/([a-z]*)/i;
