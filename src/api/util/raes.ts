import * as fs from "fs";
import * as path from "path";
import * as zod from "zod";
import * as yaml from "yaml";
import { ZodType } from "zod";
import { isPlainObject } from "@reduxjs/toolkit";
import { typedKeys } from "../../lib/typedKeys";

/**
 * rAthena Entity System
 */
export type RAES = ReturnType<typeof createRAES>;

export function createRAES(options: { rAthenaPath: string; mode: string }) {
  const { rAthenaPath, mode } = options;

  function loadNode(file: string) {
    const unknownObject = yaml.parse(
      fs.readFileSync(path.resolve(rAthenaPath, file), "utf-8")
    );
    filterNulls(unknownObject);
    return dbNode.parse(unknownObject);
  }

  function resolve<Entity, Key>(
    file: string,
    entityType: ZodType<Entity>,
    getKey: (entity: Entity) => Key,
    process: (entity: Entity) => void = noop
  ): Map<Key, Entity> {
    const imports: ImportNode[] = [{ Path: file, Mode: mode }];
    const entities = new Map<Key, Entity>();

    while (imports.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const imp = imports.shift()!;
      if (!imp.Mode || imp.Mode === mode) {
        const { Body, Footer } = loadNode(imp.Path);
        for (const raw of Body ?? []) {
          const entity = entityType.parse(raw);
          process(entity);
          entities.set(getKey(entity), entity);
        }
        imports.push(...(Footer?.Imports ?? []));
      }
    }

    return entities;
  }
  return {
    resolve,
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
