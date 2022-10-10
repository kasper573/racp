import {
  addIssueToContext,
  ParseInput,
  ParseReturnType,
  INVALID,
  OK,
  ZodObject,
} from "zod";
import * as zod from "zod";
import { ZodRawShape, ZodTypeAny } from "zod/lib/types";

/**
 * Just like ZodObject but with a custom input parser.
 * Useful when you want a type that ends up being an object but is parsed from a non object input.
 */
export class ZodCustomObject<
  Input,
  OutputShape extends ZodRawShape
> extends ZodObject<
  OutputShape,
  "strip",
  ZodTypeAny,
  zod.infer<ZodObject<OutputShape>>,
  Input
> {
  constructor(
    shape: OutputShape,
    private customParse: (input: Input) => zod.infer<ZodObject<OutputShape>>
  ) {
    super(zod.object(shape)._def);
  }
  _parse(
    input: ParseInput
  ): ParseReturnType<zod.infer<ZodObject<OutputShape>>> {
    try {
      const output = this.customParse(input.data);
      return OK(output);
    } catch (e) {
      const context = this._getOrReturnCtx(input);
      if (e instanceof zod.ZodError) {
        for (const issue of e.issues) {
          addIssueToContext(context, issue);
        }
      } else {
        addIssueToContext(context, {
          code: "custom",
          message: e instanceof Error ? e.message : `${e}`,
        });
      }
    }
    return INVALID;
  }
}
