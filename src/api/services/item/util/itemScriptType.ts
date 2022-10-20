import * as zod from "zod";
import { ParseInput, ParseReturnType, ZodType } from "zod";
import { dedupe } from "../../../rathena/util/dedupe";
import { chainParse } from "../../../../lib/zod/chainParse";

const parsedItemScript = zod.object({
  raw: zod.string(),
  meta: zod.object({
    elements: zod.array(zod.string()),
    statuses: zod.array(zod.string()),
    races: zod.array(zod.string()),
  }),
});

export type ItemScript = zod.infer<typeof parsedItemScript>;

export class ZodItemScript extends ZodType<ItemScript> {
  _parse = (input: ParseInput): ParseReturnType<ItemScript> => {
    if (typeof input.data === "string") {
      return { status: "valid", value: parse(input.data) };
    }
    return chainParse(parsedItemScript, this, input);
  };
}

export const itemScriptType = new ZodItemScript({});

function parse(str: string) {
  return {
    raw: str,
    meta: {
      elements: dedupe(extract(str, "Ele_(\\w+)")),
      statuses: dedupe(extract(str, "Eff_(\\w+)")),
      races: dedupe(extract(str, "RC_(\\w+)")),
    },
  };
}

function extract(str: string, expStr: string) {
  const values: string[] = [];
  let match: RegExpMatchArray | null;
  const exp = new RegExp(expStr, "gm");
  while ((match = exp.exec(str))) {
    values.push(match[1]);
  }
  return values;
}
