import { ParseInput, ParseReturnType, ZodType } from "zod";
import { dedupe } from "../../../util/dedupe";

export interface ItemScript {
  raw: string;
  meta: {
    elements: string[];
    statuses: string[];
    races: string[];
  };
}

export class ZodItemScript extends ZodType<ItemScript> {
  _parse(input: ParseInput): ParseReturnType<ItemScript> {
    return {
      status: "valid",
      value: {
        raw: String(input.data),
        meta: {
          elements: dedupe(extract(input.data, "Ele_(\\w+)")),
          statuses: dedupe(extract(input.data, "Eff_(\\w+)")),
          races: dedupe(extract(input.data, "RC_(\\w+)")),
        },
      },
    };
  }
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

export const itemScriptType = new ZodItemScript({});
