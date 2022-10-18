import * as path from "path";
import { AnyZodObject, ZodType } from "zod";
import { createResourceManager as createResourceManagerImpl } from "../lib/createResourceManager";
import { Logger } from "../lib/logger";
import {
  FileRepository,
  FileRepositoryOptions,
} from "../lib/repo/FileRepository";
import { Linker } from "../lib/fs/createPublicFileLinker";
import { ImageFormatter } from "../lib/image/createImageFormatter";
import { Maybe, Repository } from "../lib/repo/Repository";
import { YamlRepository, YamlResolver } from "./rathena/YamlRepository";
import {
  createScriptEntityResolver,
  ScriptRepository,
} from "./rathena/ScriptRepository";
import { RAthenaMode } from "./options";
import { ImageRepository } from "./common/ImageRepository";
import { TxtRepository } from "./rathena/TxtRepository";

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
  return createResourceManagerImpl<Repository<any>>()
    .add(
      "file",
      <T, Default extends Maybe<T>>(
        inlineOptions: Omit<
          FileRepositoryOptions<T, Default>,
          "directory" | "logger"
        >
      ) => {
        if (!dataFolder) {
          throw new Error("Data folder not set");
        }
        return new FileRepository({
          ...options,
          ...inlineOptions,
          directory: path.join(process.cwd(), dataFolder),
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
    .add(
      "txt",
      <ET extends AnyZodObject>(
        startFolder: string,
        relativeFilePath: string,
        entityType: ET
      ) =>
        new TxtRepository({
          ...options,
          startFolder,
          relativeFilePath,
          entityType,
        })
    )
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
