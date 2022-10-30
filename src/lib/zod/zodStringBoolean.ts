import * as zod from "zod";

export const zodStringBoolean = (truthyValues = ["true", "yes", "1"]) =>
  zod.string().transform((value) => truthyValues.includes(value.toLowerCase()));
