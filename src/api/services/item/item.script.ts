import { ParseInput, ParseReturnType, ZodType } from "zod";

export class ItemScriptType extends ZodType<ItemScript> {
  _parse(raw: ParseInput): ParseReturnType<ItemScript> {
    const elements: string[] = ["foo"];
    const statuses: string[] = ["bar"];
    const races: string[] = ["baz"];
    return {
      status: "valid",
      value: {
        raw: String(raw),
        meta: { elements, statuses, races },
      },
    };
  }
}

export interface ItemScript {
  raw: string;
  meta: {
    elements: string[];
    statuses: string[];
    races: string[];
  };
}

export const itemScriptType = new ItemScriptType({});
