import * as path from "path";
import { ZodType } from "zod";
import { createResourceManager as createResourceManagerImpl } from "../lib/createResourceManager";
import { Logger } from "../lib/logger";
import { FileProtocol, FileRepository } from "../lib/repo/FileRepository";
import { YamlRepository, YamlResolver } from "./rathena/YamlDriver";
import {
  createScriptEntityResolver,
  ScriptRepository,
} from "./rathena/ScriptDriver";
import { RAthenaMode } from "./options";

export type ResourceFactory = ReturnType<
  typeof createResourceManager
>["create"];

export function createResourceManager({
  dataFolder,
  ...options
}: {
  rAthenaPath: string;
  rAthenaMode: RAthenaMode;
  dataFolder: string;
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
    .add(
      "file",
      <Data>(relativeFilename: string, protocol: FileProtocol<Data>) =>
        new FileRepository({
          directory: path.join(process.cwd(), dataFolder),
          relativeFilename,
          protocol,
          ...options,
        })
    )
    .build();
}
