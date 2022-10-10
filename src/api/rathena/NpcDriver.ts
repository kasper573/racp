import * as path from "path";
import * as zod from "zod";
import { matchRecursive } from "xregexp";
import { ZodType } from "zod";
import { ZodTypeDef } from "zod/lib/types";
import { Logger } from "../../lib/logger";
import { RAthenaMode } from "../options";
import { gfs } from "../util/gfs";
import { defined } from "../../lib/std/defined";
import { createSegmentedObject } from "../../lib/zod/ZodSegmentedObject";

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
  const npcFilesPromise = loadAllNpcFiles(rAthenaPath, rAthenaMode, logger);

  return {
    async resolve<ET extends AnyNpcEntityType>(
      entityType: ET
    ): Promise<Array<zod.infer<ET>>> {
      const npcFiles = await npcFilesPromise;
      const results = await Promise.all(
        npcFiles.map((file) => parseNpcFileAs(file, entityType))
      );
      return results.flat();
    },
  };
}

const createNpcEntityId = (file: string, index: number) => `${file}#${index}`;

async function loadAllNpcFiles(
  rAthenaPath: string,
  rAthenaMode: RAthenaMode,
  logger: Logger
): Promise<ParsedNonTypesafeNpcFile[]> {
  const npcFolder = path.resolve(rAthenaPath, "npc");
  const scriptMainFile = path.resolve(
    npcFolder,
    modeFolderNames[rAthenaMode],
    "scripts_main.conf"
  );

  const loadedFiles: ParsedNonTypesafeNpcFile[] = [];
  const importQueue = [scriptMainFile];
  while (importQueue.length > 0) {
    const batch = importQueue.splice(0, importQueue.length);
    const result = await Promise.allSettled(batch.map(loadNpcFile));
    const files = defined(result.map((r) => "value" in r && r.value));
    logNpcFileLoadResult(batch, result, logger);
    loadedFiles.push(...files);
    const newImports = files
      .map((file) => parseNpcFileAs(file, npcImportEntity))
      .flat()
      .map((i) => path.resolve(rAthenaPath, i.path));
    importQueue.push(...newImports);
  }

  return loadedFiles;
}

function logNpcFileLoadResult(
  files: string[],
  settled: PromiseSettledResult<ParsedNonTypesafeNpcFile>[],
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

async function loadNpcFile(file: string): Promise<ParsedNonTypesafeNpcFile> {
  const entities = await gfs.readFile(file, "utf-8").then(parseTextEntities);
  return {
    file,
    entities,
  };
}

function parseNpcFileAs<ET extends AnyNpcEntityType>(
  { file, entities }: ParsedNonTypesafeNpcFile,
  entityType: ET
): zod.infer<ET>[] {
  return entities.reduce((entities: Array<zod.infer<ET>>, matrix, index) => {
    const res = entityType.safeParse([
      [createNpcEntityId(file, index)],
      ...matrix,
    ]);
    if (res.success) {
      entities.push(res.data);
    }
    return entities;
  }, []);
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

const npcImportRegex = /^(npc|import):\s*(.*)$/;
const npcImportEntity = createSegmentedObject()
  .segment({ npcEntityId: zod.string() })
  .segment({
    path: zod
      .string()
      .regex(npcImportRegex)
      .transform((res) => npcImportRegex.exec(res)![2]),
  })
  .build();

export type TextMatrixEntry = string[][];

export type AnyNpcEntityType = ZodType<
  {
    // Must be the first segment of the input text matrix
    npcEntityId: string;
  },
  ZodTypeDef,
  TextMatrixEntry
>;

interface ParsedNonTypesafeNpcFile {
  file: string;
  entities: TextMatrixEntry[];
}
