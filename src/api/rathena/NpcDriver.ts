import * as path from "path";
import * as zod from "zod";
import { matchRecursive } from "xregexp";
import { ZodObject, ZodString } from "zod";
import { Logger } from "../../lib/logger";
import { RAthenaMode } from "../options";
import { gfs } from "../util/gfs";

export type NpcDriver = ReturnType<typeof createNpcDriver>;

export function createNpcDriver({
  rAthenaPath,
  rAthenaMode,
  logger: parentLogger,
}: {
  rAthenaPath: string;
  rAthenaMode: RAthenaMode;
  logger: Logger;
}) {
  const logger = parentLogger.chain("npc");
  const npcFilesPromise = logger.wrap(function load() {
    return loadNpcFiles(rAthenaPath, rAthenaMode);
  })();

  return {
    async resolve<ET extends AnyNpcEntityType>(
      entityType: ET
    ): Promise<Array<zod.infer<ET>>> {
      const parseNpcFile = createNpcFileParser(entityType, logger);
      const npcFiles = await npcFilesPromise;
      const results = await Promise.all(npcFiles.map(parseNpcFile));
      return results.flat();
    },
  };
}

async function listFilesIn(folderPath: string, extension: string) {
  const files = await gfs.readdir(folderPath);
  return files
    .filter((file) => file.endsWith(extension))
    .map((file) => path.resolve(folderPath, file));
}

const readFile = (file: string) => gfs.readFile(file, "utf-8");

const createNpcEntityId = (file: string, index: number) => `${file}#${index}`;

function createNpcFileParser<ET extends AnyNpcEntityType>(
  entityType: ET,
  parentLogger: Logger
) {
  return async function parseNpcFile({
    file,
    content,
  }: {
    file: string;
    content: string;
  }) {
    const logger = parentLogger.chain("parse").chain(file);
    let textEntities;
    try {
      textEntities = parseTextEntities(content);
    } catch (e) {
      logger.warn("File skipped:", e instanceof Error ? e.message : e);
      return [];
    }
    return textEntities.reduce(
      (entities: Array<zod.infer<ET>>, matrix, index) => {
        const res = entityType.safeParse([
          [createNpcEntityId(file, index)],
          ...matrix,
        ]);
        if (res.success) {
          entities.push(res.data);
        }
        return entities;
      },
      []
    );
  };
}

async function loadNpcFiles(rAthenaPath: string, rAthenaMode: RAthenaMode) {
  const npcFolder = path.resolve(rAthenaPath, "npc");
  const scriptMainFile = path.resolve(
    npcFolder,
    modeFolderNames[rAthenaMode],
    "scripts_main.conf"
  );

  const npcFileNames = await loadNpcConfFile(scriptMainFile, rAthenaPath);

  return Promise.all(
    npcFileNames.map(async (file) => ({
      file,
      content: await readFile(file),
    }))
  );
}

async function loadNpcConfFile(npcConfFile: string, rAthenaPath: string) {
  let text: string;
  try {
    text = await readFile(npcConfFile);
  } catch (e) {
    // "File not found" errors are ignored and treated as empty configuration records
    if ((e as NodeJS.ErrnoException)?.code === "ENOENT") {
      return [];
    }
    throw e;
  }
  try {
    return parseTextEntities(text)
      .map(([[content]]) => /^(npc|import):\s*(.*?)\s*$/.exec(content))
      .filter(Boolean)
      .map((res) => path.resolve(rAthenaPath, res![2]));
  } catch (e) {
    throw new Error(`Error parsing npc conf file: ${npcConfFile}: ${e}`);
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

const nonEmptyLines = (s: string) => s.split(/[\r\n]+/).filter((l) => l.trim());

const removeComments = (s: string) =>
  s.replaceAll(/\/\/.*$/gm, "").replaceAll(/\/\*(.|[\r\n])*?\*\//gm, "");

const modeFolderNames: Record<RAthenaMode, string> = {
  Renewal: "re",
  Prerenewal: "pre-re",
};

export type TextMatrixEntry = string[][];

export type AnyNpcEntityType = ZodObject<{
  // Must be the first segment
  npcEntityId: ZodString;
}>;
