import * as fs from "fs";
import * as path from "path";
import * as zod from "zod";
import * as yaml from "yaml";
import { ZodType } from "zod";

/**
 * rAthena Entity System
 */
export function createRAES(options: { rAthenaPath: string; mode: string }) {
  const { rAthenaPath, mode } = options;

  async function loadNode(file: string) {
    return dbNode.parse(
      yaml.parse(
        await fs.promises.readFile(path.resolve(rAthenaPath, file), "utf-8")
      )
    );
  }

  async function resolve<Entity, Key>(
    file: string,
    entityType: ZodType<Entity>,
    getKey: (entity: Entity) => Key,
    entities = new Map<Key, Entity>()
  ): Promise<Map<Key, Entity>> {
    const imports: ImportNode[] = [{ Path: file, Mode: mode }];

    while (imports.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const imp = imports.shift()!;
      if (!imp.Mode || imp.Mode === mode) {
        const { Body, Footer } = await loadNode(imp.Path);
        for (const raw of Body ?? []) {
          const entity = entityType.parse(raw);
          entities.set(getKey(entity), entity);
        }
        imports.push(...(Footer?.Imports ?? []));
      }
    }

    return entities;
  }
  return {
    resolve,
    alloc<Entity, Key>(
      file: string,
      entityType: ZodType<Entity>,
      getKey: (entity: Entity) => Key
    ) {
      const entities = new Map<Key, Entity>();
      resolve(file, entityType, getKey, entities);
      return entities;
    },
  };
}

export type RAES = ReturnType<typeof createRAES>;

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
