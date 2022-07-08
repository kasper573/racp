import * as fs from "fs";
import * as path from "path";
import * as zod from "zod";
import * as yaml from "yaml";
import { ZodType } from "zod";
import { isPlainObject } from "@reduxjs/toolkit";
import { typedKeys } from "../../lib/typedKeys";
import { Logger } from "../util/logger";

export type YamlDriver = ReturnType<typeof createYamlDriver>;

export function createYamlDriver({
  rAthenaPath,
  rAthenaMode,
  logger,
}: {
  rAthenaPath: string;
  rAthenaMode: string;
  logger: Logger;
}) {
  const loadNode = logger.wrap(function loadNode(file: string) {
    const unknownObject = yaml.parse(
      fs.readFileSync(path.resolve(rAthenaPath, file), "utf-8")
    );
    filterNulls(unknownObject);
    return dbNode.parse(unknownObject);
  });

  const resolve = logger.wrap(function resolve<ET extends ZodType, Key>(
    file: string,
    { entityType, getKey, postProcess = noop }: YamlResolver<ET, Key>
  ): Map<Key, zod.infer<ET>> {
    const imports: ImportNode[] = [{ Path: file, Mode: rAthenaMode }];
    const entities = new Map<Key, zod.infer<ET>>();

    while (imports.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const imp = imports.shift()!;
      if (!imp.Mode || imp.Mode === rAthenaMode) {
        const { Body, Footer } = loadNode(imp.Path);
        for (const raw of Body ?? []) {
          const entity = entityType.parse(raw);
          entities.set(getKey(entity), entity);
        }
        imports.push(...(Footer?.Imports ?? []));
      }
    }

    for (const entity of Array.from(entities.values())) {
      postProcess(entity, entities);
    }

    return entities;
  });

  return {
    resolve,
  };
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

const dbNode = zod.object({
  Header: headerNode,
  Body: bodyNode.optional(),
  Footer: footerNode.optional(),
});

function filterNulls(value: unknown) {
  if (Array.isArray(value)) {
    for (const item of value) {
      filterNulls(item);
    }
  } else if (isPlainObject(value)) {
    for (const key of typedKeys(value)) {
      if (value[key] === null) {
        delete value[key];
      } else {
        filterNulls(value[key]);
      }
    }
  }
}

const noop = () => undefined;
