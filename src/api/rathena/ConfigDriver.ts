import * as path from "path";
import { Logger } from "../../lib/logger";
import { FileProtocol, FileRepository } from "../../lib/repo/FileRepository";

export type ConfigDriver = ReturnType<typeof createConfigDriver>;

export function createConfigDriver({
  rAthenaPath,
  logger,
}: {
  rAthenaPath: string;
  logger: Logger;
}) {
  return {
    resolve(configName: string) {
      return new FileRepository({
        logger,
        directory: path.resolve(rAthenaPath, "conf"),
        relativeFilename: configName,
        protocol: configFileProtocol,
      });
    },
  };
}

export type Config = Record<string, string>;

export const configFileProtocol: FileProtocol<Config> = {
  serialize(config) {
    return Object.entries(config)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  },

  parse(fileContent) {
    const matches = fileContent
      .replaceAll(/\/\/.*$/gm, "")
      .matchAll(/^([\w_]+):(.*)/gm);
    const data = Array.from(matches).reduce((record, [, key, value]) => {
      record[key.trim()] = value.trim();
      return record;
    }, {} as Config);
    return { success: true, data };
  },
};
