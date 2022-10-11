import * as path from "path";
import * as zod from "zod";
import { matchRecursive } from "xregexp";
import { ZodType } from "zod";
import { ZodTypeDef } from "zod/lib/types";
import { base64encode } from "byte-base64";
import { Logger } from "../../lib/logger";
import { RAthenaMode } from "../options";
import { gfs } from "../util/gfs";
import { defined } from "../../lib/std/defined";
import { createSegmentedObject } from "../../lib/zod/ZodSegmentedObject";

export type ScriptDriver = ReturnType<typeof createScriptDriver>;

export function createScriptDriver({
  rAthenaPath,
  rAthenaMode,
  logger: parentLogger,
}: {
  rAthenaPath: string;
  rAthenaMode: RAthenaMode;
  logger: Logger;
}) {
  const logger = parentLogger.chain("script");
  const scriptFilesPromise = loadAllScriptFiles(
    rAthenaPath,
    rAthenaMode,
    logger
  );

  return {
    async resolve<ET extends AnyScriptEntityType>(
      entityType: ET
    ): Promise<Array<zod.infer<ET>>> {
      const scriptFiles = await scriptFilesPromise;
      const results = await Promise.all(
        scriptFiles.map((file) => parseScriptFileAs(file, entityType))
      );
      return results.flat();
    },
  };
}

const createScriptId = (file: string, index: number) =>
  base64encode(`${file}#${index}`);

async function loadAllScriptFiles(
  rAthenaPath: string,
  rAthenaMode: RAthenaMode,
  logger: Logger
): Promise<ParsedNonTypesafeScriptFile[]> {
  const scriptFolder = path.resolve(rAthenaPath, "npc");
  const scriptMainFile = path.resolve(
    scriptFolder,
    modeFolderNames[rAthenaMode],
    "scripts_main.conf"
  );

  const loadedFiles: ParsedNonTypesafeScriptFile[] = [];
  const importQueue = [scriptMainFile];
  while (importQueue.length > 0) {
    const batch = importQueue.splice(0, importQueue.length);
    const result = await Promise.allSettled(batch.map(loadScriptFile));
    const files = defined(result.map((r) => "value" in r && r.value));
    logScriptFileLoadResult(batch, result, logger);
    loadedFiles.push(...files);
    const newImports = files
      .map((file) => parseScriptFileAs(file, scriptImportEntity))
      .flat()
      .map((i) => path.resolve(rAthenaPath, i.path));
    importQueue.push(...newImports);
  }

  return loadedFiles;
}

function logScriptFileLoadResult(
  files: string[],
  settled: PromiseSettledResult<ParsedNonTypesafeScriptFile>[],
  logger: Logger
) {
  for (let i = 0; i < settled.length; i++) {
    const result = settled[i];
    const file = files[i];
    if (result.status === "rejected") {
      logger.warn(
        "Skipped",
        file,
        result.reason instanceof Error ? result.reason.message : result.reason
      );
    } else {
      logger.log("Loaded", file);
    }
  }
}

async function loadScriptFile(
  file: string
): Promise<ParsedNonTypesafeScriptFile> {
  const entities = await gfs.readFile(file, "utf-8").then(parseTextEntities);
  return {
    file,
    entities,
  };
}

function parseScriptFileAs<ET extends AnyScriptEntityType>(
  { file, entities }: ParsedNonTypesafeScriptFile,
  entityType: ET
): zod.infer<ET>[] {
  return entities.reduce((entities: Array<zod.infer<ET>>, matrix, index) => {
    const res = entityType.safeParse([
      [createScriptId(file, index)],
      ...matrix,
    ]);
    if (res.success) {
      entities.push(res.data);
    }
    return entities;
  }, []);
}

/**
 * Parses script text file content into an intermediate matrix data structure.
 * The matrix data will then later be passed to a known set of ZodArrayEntity
 * parsers who in turn finalizes the parsing.
 *
 * Each returned item represents an entry of some kind of script.
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

const scriptImportRegex = /^(npc|import):\s*(.*)$/;
const scriptImportEntity = createSegmentedObject()
  .segment({ scriptId: zod.string() })
  .segment({
    path: zod
      .string()
      .regex(scriptImportRegex)
      .transform((res) => scriptImportRegex.exec(res)![2]),
  })
  .build();

export type TextMatrixEntry = string[][];

export type AnyScriptEntityType = ZodType<
  {
    // Must be the first segment of the input text matrix
    scriptId: string;
  },
  ZodTypeDef,
  TextMatrixEntry
>;

interface ParsedNonTypesafeScriptFile {
  file: string;
  entities: TextMatrixEntry[];
}

export const trimUniqueNpcName = (npcName: string) => {
  const trimmed = npcName
    .replace(/#[\w-_]+/, "")
    .replace(/::[\w-_]+/, "")
    .trim();
  return trimmed || npcName;
};
