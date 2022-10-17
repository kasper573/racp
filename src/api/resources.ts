import * as path from "path";
import { ZodType } from "zod";
import { createResourceManager as createResourceManagerImpl } from "../lib/createResourceManager";
import { Logger } from "../lib/logger";
import { FileProtocol, FileRepository } from "../lib/repo/FileRepository";
import { Linker } from "../lib/fs/createPublicFileLinker";
import { ImageFormatter } from "../lib/image/createImageFormatter";
import { YamlRepository, YamlResolver } from "./rathena/YamlDriver";
import {
  createScriptEntityResolver,
  ScriptRepository,
} from "./rathena/ScriptDriver";
import { RAthenaMode } from "./options";
import { ImageRepository } from "./common/ImageRepository";

export type ResourceFactory = ReturnType<
  typeof createResourceManager
>["create"];

export function createResourceManager({
  dataFolder,
  linker,
  formatter,
  ...options
}: {
  rAthenaPath: string;
  rAthenaMode: RAthenaMode;
  dataFolder?: string;
  logger: Logger;
  linker?: Linker;
  formatter?: ImageFormatter;
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
      <Data>(relativeFilename: string, protocol: FileProtocol<Data>) => {
        if (!dataFolder) {
          throw new Error("Data folder not set");
        }
        return new FileRepository({
          directory: path.join(process.cwd(), dataFolder),
          relativeFilename,
          protocol,
          ...options,
        });
      }
    )
    .add("images", (folderName: string) => {
      if (!linker || !formatter) {
        throw new Error("Linker or formatter not set");
      }
      return new ImageRepository({
        formatter,
        linker: linker.chain(folderName),
        logger: options.logger,
      });
    })
    .build();
}