import * as path from "path";
import * as zod from "zod";
import { AnyZodObject, ZodRawShape, ZodTypeAny } from "zod";
import recursiveWatch = require("recursive-watch");
import { gfs } from "../gfs";
import { ZodCustomObject } from "../../lib/zod/ZodCustomObject";
import { defined } from "../../lib/std/defined";
import { RepositoryOptions } from "../../lib/repo/Repository";
import { RAthenaMode } from "../services/settings/types";
import { PipeableRepository } from "../../lib/repo/PipeableRepository";
import { modeFolderNames, nonEmptyLines, removeComments } from "./util/parse";

export type TxtRepositoryOptions<ET extends AnyZodObject> = RepositoryOptions<
  zod.infer<ET>[]
> & {
  rAthenaPath: string;
  startFolder: string;
  relativeFilePath: string;
  entityType: ET;
};

export class TxtRepository<ET extends AnyZodObject> extends PipeableRepository<
  { rAthenaMode: RAthenaMode },
  zod.infer<ET>[]
> {
  private readonly baseFolder = path.resolve(
    this.options.rAthenaPath,
    this.options.startFolder
  );

  constructor(private options: TxtRepositoryOptions<ET>) {
    super({
      ...options,
      defaultValue: options.defaultValue ?? [],
    });
  }

  protected observeSource(onSourceChanged: () => void) {
    return recursiveWatch(this.baseFolder, onSourceChanged);
  }

  protected async readImpl() {
    const modeFolder = path.resolve(
      this.baseFolder,
      modeFolderNames[this.pipeInput.rAthenaMode]
    );

    const importFolder = path.resolve(this.baseFolder, "import");

    const fileNames: string[] = [
      path.resolve(this.baseFolder, this.options.relativeFilePath),
      path.resolve(modeFolder, this.options.relativeFilePath),
      path.resolve(importFolder, this.options.relativeFilePath),
    ];

    const fileReadResults = await Promise.allSettled(
      fileNames.map((name) => gfs.readFile(name, "utf8"))
    );
    if (fileReadResults.every(({ status }) => status === "rejected")) {
      this.logger.warn("Skipped: File could not be found");
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

    const parser = createTxtEntityParser(this.options.entityType.shape);
    const entities = files.map(({ content, name }) =>
      parseTextTable(content).map((row, rowIndex) => {
        const result = parser.safeParse(row);
        if (!result.success) {
          this.logger.chain(name).warn(`Failed to parse row #${rowIndex}`, {
            row,
            issues: result.error.issues,
          });
        }
        return result.success ? result.data : undefined;
      })
    );

    return defined(entities.flat());
  }

  toString(): string {
    return `txt(${this.options.startFolder}/${this.options.relativeFilePath})`;
  }
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
