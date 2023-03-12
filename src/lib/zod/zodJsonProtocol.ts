import * as zod from "zod";
import { z, ZodType } from "zod";

export function zodJsonProtocol<T extends ZodType>(type: T) {
  return {
    parse(jsonString: string): ZodJsonProtocolResult<T> {
      try {
        return type.safeParse(JSON.parse(jsonString));
      } catch (error) {
        return { success: false, error };
      }
    },
    serialize: (data: zod.infer<T>) => JSON.stringify(data),
  };
}

export type ZodJsonProtocolResult<T extends ZodType> =
  | { success: true; data: z.infer<T> }
  | { success: false; error: unknown };
