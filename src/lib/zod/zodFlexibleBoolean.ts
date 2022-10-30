import * as zod from "zod";
import {
  addIssueToContext,
  INVALID,
  ParseInput,
  ParseReturnType,
  ZodType,
} from "zod";
import { ZodTypeDef } from "zod/lib/types";

export const defaultTruthyValues = ["true", "yes", "1"];

export const zodFlexibleBoolean = (truthyValues?: string[]) =>
  new ZodFlexibleBoolean(truthyValues);

export class ZodFlexibleBoolean extends ZodType<
  boolean,
  ZodTypeDef,
  boolean | number | string
> {
  constructor(private truthyValues = defaultTruthyValues) {
    super(zod.boolean()._def);
  }

  _parse(input: ParseInput): ParseReturnType<boolean> {
    const type = typeof input.data;
    let res: boolean;
    switch (type) {
      case "boolean":
        return {
          status: "valid",
          value: input.data,
        };
      case "number":
        return {
          status: "valid",
          value: input.data === 1,
        };
      case "string":
        return {
          status: "valid",
          value: this.truthyValues.includes(input.data.toLowerCase()),
        };
      default:
        addIssueToContext(this._getOrReturnCtx(input), {
          code: "invalid_type",
          expected: "boolean",
          received: type,
        });
        break;
    }
    return INVALID;
  }
}
