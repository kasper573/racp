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
  const logger = parentLogger.chain("txt");

  return {
    async resolve<ET extends AnyZodObject>(
      startFolder: string,
      relativeFilePath: string,
      { shape }: ET
    ): Promise<Array<zod.infer<ET>>> {
      const baseFolder = path.resolve(rAthenaPath, startFolder);
      const modeFolder = path.resolve(baseFolder, modeFolderNames[rAthenaMode]);
      const importFolder = path.resolve(baseFolder, importFolderName);

      const fileNames: string[] = [
        path.resolve(baseFolder, relativeFilePath),
        path.resolve(modeFolder, relativeFilePath),
        path.resolve(importFolder, relativeFilePath),
      ];

      const parser = createTxtEntityParser(shape);
      return (
        await Promise.all(
          fileNames.map((fileName) =>
            gfs
              .readFile(fileName, "utf8")
              .catch((err) => logger.warn("Failed to load file", err))
              .then((fileContent) =>
                fileContent ? parseTextTable(fileContent) : []
              )
              .then((rows) =>
                defined(
                  rows.map((row, rowIndex): zod.infer<ET> | undefined => {
                    const result = parser.safeParse(row);
                    if (!result.success) {
                      logger
                        .chain(fileName)
                        .warn(`Failed to parse row #${rowIndex}`, {
                          row,
                          issues: result.error.issues,
                        });
                      return undefined;
                    }
                    return result.data;
                  })
                )
              )
          )
        )
      ).flat();
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
