import * as zod from "zod";
import { addIssueToContext, ParseInput, ParseReturnType, ZodType } from "zod";
import { XMLParser } from "fast-xml-parser";
import { chainParse } from "../../lib/zod/chainParse";
import { reduceGraph } from "../../lib/graph";

export interface ClientTextNode {
  tag?: string;
  content?: string;
  children?: ClientTextNode[];
}

const parsedClientText: ZodType<ClientTextNode> = zod.object({
  tag: zod.string().optional(),
  content: zod.string().optional(),
  children: zod.array(zod.lazy(() => parsedClientText)).optional(),
});

/**
 * One line of text in the client. Has markup support,
 * which is why the extra parsing and data structure is necessary.
 */
export class ZodClientText extends ZodType<ClientTextNode> {
  _parse = (input: ParseInput): ParseReturnType<ClientTextNode> => {
    if (typeof input.data === "string") {
      try {
        const value = parse(input.data);
        return {
          status: "valid",
          value,
        };
      } catch (e) {
        addIssueToContext(this._getOrReturnCtx(input), {
          code: "custom",
          message: `${e}`,
        });
      }
    }
    return chainParse(parsedClientText, this, input);
  };
}

export const clientTextType = new ZodClientText({});

const strayTagRegex = /^([^<>]*)<([^<>]+)>([^<>]*)$/;

const textProperty = Symbol("textProperty");

const xmlParser = new XMLParser({
  preserveOrder: true,
  trimValues: false,
  ignoreAttributes: true,
  numberParseOptions: {
    hex: false,
    leadingZeros: false,
    skipLike: /./,
  },
  processEntities: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  textNodeName: textProperty as any,
});

function parse(content: string): ClientTextNode {
  content = entities.encode(content);
  content = content.replace(strayTagRegex, "$1"); // Remove weird stray tags that item names sometimes have
  content = /^"?(.*?)"?$/.exec(content)?.[1] ?? content; // Remove quotes
  content = content.replaceAll(/\^([A-Fa-f\d]{6})/g, ""); // Remove colors
  const [xmlRoot] = xmlParser.parse(`<root>${content}</root>`, {});
  const textRoot = xmlNodeToTextNode(xmlRoot);
  delete textRoot.tag; // Removing tag that we had to use to make xml-parser happy
  return textRoot;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type XmlNode = string | Record<keyof any, XmlNode[] | string>;

function xmlNodeToTextNode(node: XmlNode): ClientTextNode {
  if (typeof node === "string") {
    return { content: entities.decode(node) };
  }
  if (textProperty in node) {
    return { content: entities.decode(node[textProperty] as string) };
  }
  const [tag, value] = Object.entries(node)[0];
  if (!Array.isArray(value)) {
    return { tag, ...xmlNodeToTextNode(value) };
  }
  const children = value.map(xmlNodeToTextNode);
  if (isSingleOnlyText(children)) {
    return { tag, content: children[0].content };
  }
  if (children.length > 0) {
    return { tag, children };
  }
  return { tag };
}

function isSingleOnlyText(node: ClientTextNode[]): boolean {
  if (node.length !== 1) {
    return false;
  }
  const { tag, content, children } = node[0];
  return content !== undefined && tag === undefined && children === undefined;
}

// XML parser doesn't allow some symbols, so we must encode them as xml entities.
// But in our final data structure we don't want entities, so we decode them back in the end.
const entities = {
  swaps: Object.entries({
    "&": "amp",
    "=": "eq",
  }),
  encode(str: string) {
    return entities.swaps.reduce(
      (str, [symbol, entity]) => str.replaceAll(symbol, entity),
      str
    );
  },
  decode(str: string) {
    return entities.swaps.reduce(
      (str, [symbol, entity]) => str.replaceAll(entity, symbol),
      str
    );
  },
};

export function clientTextContent(node?: ClientTextNode | ClientTextNode[]) {
  return node
    ? reduceGraph(node, (str, n) => `${str}${n.content ?? ""}`, "")
    : undefined;
}
