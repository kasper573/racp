import {
  addIssueToContext,
  INVALID,
  ParseInput,
  ParseReturnType,
  ZodType,
} from "zod";
import { ZodTypeDef } from "zod/lib/types";

export const zodNumeric = () => new ZodNumeric({});

export class ZodNumeric extends ZodType<number, ZodTypeDef, number | string> {
  _parse(input: ParseInput): ParseReturnType<number> {
    const type = typeof input.data;
    let num: number;
    switch (type) {
      case "number":
        return {
          status: "valid",
          value: input.data,
        };
      case "string":
        num = parseFloat(input.data);
        if (!isNaN(num)) {
          return {
            status: "valid",
            value: num,
          };
        }
        addIssueToContext(this._getOrReturnCtx(input), {
          code: "invalid_type",
          message: "Strings must be numeric",
          expected: "string",
          received: "string",
        });
        break;
      default:
        addIssueToContext(this._getOrReturnCtx(input), {
          code: "invalid_type",
          expected: "string",
          received: type,
        });
        break;
    }
    return INVALID;
  }
}
