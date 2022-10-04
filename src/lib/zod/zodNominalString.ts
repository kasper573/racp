import * as zod from "zod";
import { ZodType } from "zod";

export function zodNominalString<T extends string>() {
  return zod.string() as unknown as ZodType<NominalString<T>>;
}
