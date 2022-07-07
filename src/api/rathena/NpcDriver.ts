import { matchRecursive } from "xregexp";
import { npcMonsterType } from "./NpcDriver.types";

export function* parseNpcEntries(text: string) {
  for (const raw of parseTextEntities(text)) {
    const monster = npcMonsterType.safeParse(raw);
    if (monster.success) {
      yield monster.data;
    } else {
      console.log(monster.error);
    }
  }
}

/**
 * Parses npc text file content into an intermediate matrix data structure.
 * The matrix data will then later be passed to a known set of ZodArrayEntity
 * parsers who in turn finalizes the parsing.
 *
 * Each returned item represents an entry of some kind of npc.
 * Each entry is a 2d array where:
 *   - the outer array represents content separated by tab
 *   - the inner array represents content separated by comma
 *
 * The parser takes script data into consideration.
 * One script will be one value in the matrix, no different from string and number values.
 */
export function parseTextEntities(text: string): TextMatrixEntry[] {
  text = removeComments(text);
  const repl = replaceScripts(text, scriptPlaceholder);
  const lines = nonEmptyLines(repl.text);
  return lines.map((line) =>
    line
      .split(/\t/)
      .map((part) => part.split(",").map((val) => repl.scripts[val] ?? val))
  );
}

export function replaceScripts<Placeholder extends string>(
  original: string,
  getPlaceholder: (scriptNumber: number) => Placeholder
) {
  const options = {
    valueNames: [null, null, "value", null],
    escapeChar: "\\",
  } as const;

  let scriptCount = 0;
  let cursor = 0;
  let replaced = "";
  const scripts = {} as Record<Placeholder, string>;

  for (const match of matchRecursive(original, "{", "}", "g", options)) {
    const start = match.start - 1;
    const end = match.end + 1;
    const script = original.substring(start, end);
    const placeholder = getPlaceholder(scriptCount++);
    scripts[placeholder] = script;
    replaced += original.substring(cursor, start);
    replaced += placeholder;
    cursor = end;
  }

  replaced += original.substring(cursor);
  return { text: replaced, scripts };
}

const scriptPlaceholder = (n: number) =>
  `_SCRIPT_PLACEHOLDER_${n}_${Date.now()}`;

const nonEmptyLines = (s: string) => s.split("\n").filter((l) => l.trim());

const removeComments = (s: string) => s.replaceAll(/\/\/.*$/gm, "");

export type TextMatrixEntry = string[][];
