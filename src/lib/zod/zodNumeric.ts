import * as zod from "zod";

export function zodNumeric() {
  return zod.string().transform((str, ctx) => {
    const n = parseFloat(str);
    if (isNaN(n)) {
      ctx.addIssue({
        code: "invalid_type",
        message: "Must be numeric string",
        expected: "number",
        received: "string",
      });
    }
    return n;
  });
}
