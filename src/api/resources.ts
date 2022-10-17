import { ZodType } from "zod";
import { createResourceManager as createResourceManagerImpl } from "../lib/createResourceManager";
import { Logger } from "../lib/logger";
import { YamlRepository, YamlResolver } from "./rathena/YamlDriver";
import {
  createScriptEntityResolver,
  ScriptRepository,
} from "./rathena/ScriptDriver";
import { RAthenaMode } from "./options";

export type ResourceFactory = ReturnType<
  typeof createResourceManager
>["create"];

export function createResourceManager(options: {
  rAthenaPath: string;
  rAthenaMode: RAthenaMode;
  logger: Logger;
}) {
  const scripts = new ScriptRepository(options);
  return createResourceManagerImpl()
    .add(
      "yaml",
      <ET extends ZodType, Key>(
        file: string,
        resolver: YamlResolver<ET, Key>
      ) => new YamlRepository({ file, resolver, ...options })
    )
    .add("script", createScriptEntityResolver(scripts))
    .build();
}
