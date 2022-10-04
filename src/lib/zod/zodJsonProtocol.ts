import * as zod from "zod";
import { ZodType } from "zod";

export function zodJsonProtocol<T extends ZodType>(type: T) {
  return {
    parse: (jsonString: string) => type.safeParse(JSON.parse(jsonString)),
    serialize: (data: zod.infer<T>) => JSON.stringify(data),
  };
}
