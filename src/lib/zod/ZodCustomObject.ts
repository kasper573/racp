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

export type Parser<Input, Output> = (input: Input) => Output;

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
  private readonly customParsers: Parser<
    Input,
    zod.infer<ZodObject<OutputShape>>
  >[];

  constructor(
    shape: OutputShape,
    ...customParsers: Parser<Input, zod.infer<ZodObject<OutputShape>>>[]
  ) {
    super(zod.object(shape)._def);
    this.customParsers = customParsers;
  }

  _parse(
    input: ParseInput
  ): ParseReturnType<zod.infer<ZodObject<OutputShape>>> {
    const res = zod.object(this.shape).safeParse(input.data);
    if (res.success) {
      return OK(res.data);
    }

    let error: unknown;
    for (const parse of this.customParsers) {
      try {
        const output = parse(input.data);
        return OK(output);
      } catch (e) {
        error = e;
      }
    }

    const context = this._getOrReturnCtx(input);
    if (error instanceof zod.ZodError) {
      for (const issue of error.issues) {
        addIssueToContext(context, issue);
      }
    } else {
      addIssueToContext(context, {
        code: "custom",
        message: error instanceof Error ? error.message : `${error}`,
      });
    }

    return INVALID;
  }
}
