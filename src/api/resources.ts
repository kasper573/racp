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
import { ImageRepository } from "./common/ImageRepository";
import { TxtRepository } from "./rathena/TxtRepository";
import {
  ConfigRepository,
  ConfigRepositoryOptions,
} from "./rathena/ConfigRepository";
import { AdminSettingsRepository } from "./services/settings/repository";

export type ResourceFactory = ReturnType<
  typeof createResourceManager
>["create"];

export function createResourceManager({
  dataFolder,
  linker,
  formatter,
  settings,
  ...options
}: {
  rAthenaPath: string;
  dataFolder?: string;
  logger: Logger;
  linker?: Linker;
  formatter?: ImageFormatter;
  settings: AdminSettingsRepository;
}) {
  let scripts: ScriptRepository;

  const manager = createResourceManagerImpl<Repository<any>>()
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
          directory: dataFolder,
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
        settings.pipe(
          new TxtRepository({
            ...options,
            startFolder,
            relativeFilePath,
            entityType,
          })
        )
    )
    .add(
      "yaml",
      <ET extends ZodType, Key>(
        file: string,
        resolver: YamlResolver<ET, Key>
      ) => settings.pipe(new YamlRepository({ file, resolver, ...options }))
    )
    .add(
      "config",
      (args: Omit<ConfigRepositoryOptions, "rAthenaPath" | "logger">) =>
        new ConfigRepository({ ...args, ...options })
    )
    .add(
      "script",
      createScriptEntityResolver(() => scripts)
    )
    .build();

  manager.add(settings);

  try {
    settings.images = manager.create.images("settings");
  } catch (e) {
    options.logger.warn(
      `Could not provide image repository to settings repository: ${
        (e as Error)?.message
      }`
    );
  }

  scripts = manager.createUsing(() =>
    settings.pipe(new ScriptRepository(options))
  );

  return manager;
}
