import * as zod from "zod";
import { ParseInput, ParseReturnType, ZodType } from "zod";
import { chainParse } from "../../lib/zod/chainParse";

const parsedClientText = zod.array(
  zod.object({
    color: zod.string().optional(),
    text: zod.string(),
  })
);

export type ClientTextData = zod.infer<typeof parsedClientText>;

/**
 * One line of text in the client. Has embedded string color support,
 * which is why the extra parsing and data structure is necessary.
 */
export class ZodClientText extends ZodType<ClientTextData> {
  _parse = (input: ParseInput): ParseReturnType<ClientTextData> => {
    if (typeof input.data === "string") {
      return {
        status: "valid",
        value: parse(input.data),
      };
    }
    return chainParse(parsedClientText, this, input);
  };
}

export const clientTextType = new ZodClientText({});

export function clientTextToString(text: ClientTextData) {
  return text.map(({ text }) => text).join("");
}

function parse(untrimmed: string): ClientTextData {
  const str = /^"?(.*?)"?$/.exec(untrimmed)?.[1] ?? "";

  let color: string | undefined;
  let start = 0;
  const parsed: ClientTextData = [];

  function push(end: number) {
    parsed.push({ color, text: str.substring(start, end) });
  }

  for (const match of str.matchAll(/\^([A-Fa-f\d]{6})/g)) {
    const n = match.index as number;
    push(n);
    color = match[1];
    start = n + color.length + 1;
  }

  push(str.length);
  return parsed;
}
