import * as path from "path";
import * as zod from "zod";
import { AnyZodObject, ZodRawShape, ZodTypeAny } from "zod";
import { RAthenaMode } from "../options";
import { Logger } from "../../lib/logger";
import { gfs } from "../gfs";
import { ZodCustomObject } from "../../lib/zod/ZodCustomObject";
import { defined } from "../../lib/std/defined";
import {
  importFolderName,
  modeFolderNames,
  nonEmptyLines,
  removeComments,
} from "./parse";

export type TxtDriver = ReturnType<typeof createTxtDriver>;

export function createTxtDriver({
  rAthenaPath,
  rAthenaMode,
  logger: parentLogger,
}: {
  rAthenaPath: string;
  rAthenaMode: RAthenaMode;
  logger: Logger;
}) {
  return {
    async resolve<ET extends AnyZodObject>(
      startFolder: string,
      relativeFilePath: string,
      { shape }: ET
    ): Promise<Array<zod.infer<ET>>> {
      const logger = parentLogger
        .chain("txt")
        .chain(startFolder)
        .chain(relativeFilePath);

      const baseFolder = path.resolve(rAthenaPath, startFolder);
      const modeFolder = path.resolve(baseFolder, modeFolderNames[rAthenaMode]);
      const importFolder = path.resolve(baseFolder, importFolderName);

      const fileNames: string[] = [
        path.resolve(baseFolder, relativeFilePath),
        path.resolve(modeFolder, relativeFilePath),
        path.resolve(importFolder, relativeFilePath),
      ];

      const fileReadResults = await Promise.allSettled(
        fileNames.map((name) => gfs.readFile(name, "utf8"))
      );
      if (fileReadResults.every(({ status }) => status === "rejected")) {
        logger.warn("Skipped: File could not be found");
        return [];
      }

      const files = defined(
        fileReadResults.map(
          (result, index) =>
            result.status === "fulfilled" && {
              content: result.value,
              name: fileNames[index],
            }
        )
      );

      const parser = createTxtEntityParser(shape);
      const entities = files.map(({ content, name }) =>
        parseTextTable(content).map((row, rowIndex) => {
          const result = parser.safeParse(row);
          if (!result.success) {
            logger.chain(name).warn(`Failed to parse row #${rowIndex}`, {
              row,
              issues: result.error.issues,
            });
          }
          return result.success ? result.data : undefined;
        })
      );

      return defined(entities.flat());
    },
  };
}

function createTxtEntityParser<Shape extends ZodRawShape>(shape: Shape) {
  const properties = Object.entries(shape);
  type Entity = zod.objectOutputType<Shape, ZodTypeAny>;
  return new ZodCustomObject<string[], Shape>(shape, (cells) =>
    properties.reduce((obj, [name, propType], index) => {
      obj[name as keyof Entity] = propType.parse(cells[index]);
      return obj;
    }, {} as Entity)
  );
}

function parseTextTable(text: string) {
  const lines = nonEmptyLines(removeComments(text));
  return lines.map((line) => line.split(","));
}
