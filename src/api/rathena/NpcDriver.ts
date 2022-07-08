import * as path from "path";
import * as fs from "fs";
import * as zod from "zod";
import { matchRecursive } from "xregexp";
import { ZodArrayEntity } from "../../lib/zod/ZodArrayEntity";
import { Logger } from "../../lib/logger";

export type NpcDriver = ReturnType<typeof createNpcDriver>;

export function createNpcDriver({
  rAthenaPath,
  rAthenaMode,
  logger,
}: {
  rAthenaPath: string;
  rAthenaMode: keyof typeof modeFolderNames;
  logger: Logger;
}) {
  const npcFolder = path.resolve(rAthenaPath, "npc");
  const modeFolder = path.resolve(npcFolder, modeFolderNames[rAthenaMode]);

  return {
    resolve<ET extends ZodArrayEntity>(npcConfFile: string, entityType: ET) {
      const parseEntities = createNpcParser(entityType);
      const loadEntities = logger.wrap(async function load(f: string) {
        return parseEntities(await readFile(f));
      });

      async function loadViaConfFile(npcConfFile: string) {
        const files = await loadNpcConfFile(npcConfFile, rAthenaPath);
        const entities = await Promise.all(files.map(loadEntities));
        return entities.reduce(
          (flattened, list) => [...flattened, ...list],
          []
        );
      }

      const entities: Array<zod.infer<ET>> = [];
      Promise.all([
        loadViaConfFile(path.resolve(npcFolder, npcConfFile)),
        loadViaConfFile(path.resolve(modeFolder, npcConfFile)),
      ]).then(([baseEntities, modeEntities]) => {
        entities.push(...baseEntities, ...modeEntities);
      });

      return entities;
    },
  };
}

const readFile = (file: string) => fs.promises.readFile(file, "utf-8");

function createNpcParser<ET extends ZodArrayEntity>(entityType: ET) {
  return (text: string) =>
    parseTextEntities(text).reduce((entities: Array<zod.infer<ET>>, matrix) => {
      const res = entityType.safeParse(matrix);
      return res.success ? [...entities, res.data] : entities;
    }, []);
}

async function loadNpcConfFile(npcConfFile: string, rAthenaPath: string) {
  const text = await readFile(npcConfFile);
  const entities = parseTextEntities(text).map((matrix) =>
    npcConfEntity.parse(matrix)
  );
  return entities.map((entity) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    path.resolve(rAthenaPath, npcCommandRegex.exec(entity.content)![1])
  );
}

const npcCommandRegex = /^npc:\s*(.*)$/;
const npcConfEntity = new ZodArrayEntity([
  { content: zod.string().regex(npcCommandRegex) },
]);

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

const nonEmptyLines = (s: string) => s.split(/[\r\n]+/).filter((l) => l.trim());

const removeComments = (s: string) => s.replaceAll(/\/\/.*$/gm, "");

const modeFolderNames = {
  Renewal: "re",
  Prerenewal: "pre-re",
};

export type TextMatrixEntry = string[][];
