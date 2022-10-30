import * as path from "path";
import * as zod from "zod";
import { ZodType } from "zod";
import * as yaml from "yaml";
import { isPlainObject } from "lodash";
import recursiveWatch = require("recursive-watch");
import { typedKeys } from "../../lib/std/typedKeys";
import { gfs } from "../gfs";
import { RepositoryOptions } from "../../lib/repo/Repository";
import { RAthenaMode } from "../services/settings/types";
import { PipeableRepository } from "../../lib/repo/PipeableRepository";

export type YamlRepositoryOptions<ET extends ZodType, Key> = RepositoryOptions<
  Map<Key, zod.infer<ET>>
> & {
  rAthenaPath: string;
  file: string;
  resolver: YamlResolver<ET, Key>;
};

export class YamlRepository<ET extends ZodType, Key> extends PipeableRepository<
  { rAthenaMode: RAthenaMode },
  Map<Key, zod.infer<ET>>
> {
  constructor(private options: YamlRepositoryOptions<ET, Key>) {
    super({
      ...options,
      defaultValue: options.defaultValue ?? new Map(),
    });
  }

  protected observeSource(onSourceChanged: () => void): () => void {
    return recursiveWatch(
      path.dirname(path.resolve(this.options.rAthenaPath, this.options.file)),
      onSourceChanged
    );
  }

  protected async readImpl() {
    const { entityType, getKey, postProcess = noop } = this.options.resolver;
    const { rAthenaMode } = this.pipeInput;

    const registry = new Map<Key, zod.infer<ET>>();
    for (const rawEntity of await this.loadRaw(rAthenaMode)) {
      const entity = entityType.parse(rawEntity);
      registry.set(getKey(entity), entity);
    }

    for (const entity of registry.values()) {
      postProcess(entity, registry);
    }

    return registry;
  }

  private async loadRaw(rAthenaMode: RAthenaMode) {
    const { file } = this.options;

    const imports: ImportNode[] = [{ Path: file, Mode: rAthenaMode }];
    const raw: unknown[] = [];
    while (imports.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const imp = imports.shift()!;
      if (!imp.Mode || imp.Mode === rAthenaMode) {
        const res = await this.loadNode(imp.Path);
        if (!res) {
          continue;
        }
        const { Body, Footer } = res;
        raw.push(...(Body ?? []));
        imports.push(...(Footer?.Imports ?? []));
      }
    }
    return raw;
  }

  private async loadNode(file: string): Promise<DBNode | undefined> {
    const filePath = path.resolve(this.options.rAthenaPath, file);
    let content: string;
    try {
      content = await gfs.readFile(filePath, "utf-8");
    } catch (e) {
      return;
    }
    const unknownObject = yaml.parse(content);
    filterNulls(unknownObject);
    const result = dbNode.safeParse(unknownObject);
    if (!result.success) {
      this.logger.error(
        "Ignoring node. Unexpected YAML structure. Error info: ",
        JSON.stringify({ file, issues: result.error.issues }, null, 2)
      );
      return;
    }
    return result.data;
  }

  toString() {
    return `yaml(${this.options.file})`;
  }
}

export interface YamlResolver<ET extends ZodType, Key> {
  entityType: ET;
  getKey: (entity: zod.infer<ET>) => Key;
  postProcess?: (
    entity: zod.infer<ET>,
    registry: Map<Key, zod.infer<ET>>
  ) => void;
}

export function createYamlResolver<ET extends ZodType, Key>(
  entityType: ET,
  rest: Omit<YamlResolver<ET, Key>, "entityType">
): YamlResolver<ET, Key> {
  return {
    entityType,
    ...rest,
  };
}

const headerNode = zod.object({
  Type: zod.string(),
  Version: zod.number(),
});

type ImportNode = zod.infer<typeof importNode>;
const importNode = zod.object({
  Path: zod.string(),
  Mode: zod.string().optional(),
});

const footerNode = zod.object({
  Imports: zod.array(importNode),
});

const bodyNode = zod.array(zod.unknown());

type DBNode = zod.infer<typeof dbNode>;
const dbNode = zod.object({
  Header: headerNode.optional(),
  Body: bodyNode.optional(),
  Footer: footerNode.optional(),
});

function filterNulls(value: unknown) {
  if (Array.isArray(value)) {
    for (const item of value) {
      filterNulls(item);
    }
  } else if (isPlainObject(value)) {
    for (const key of typedKeys(value as object)) {
      if ((value as object)[key] === null) {
        delete (value as object)[key];
      } else {
        filterNulls((value as object)[key]);
      }
    }
  }
}

const noop = () => undefined;
