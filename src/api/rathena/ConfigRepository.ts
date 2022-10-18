import * as path from "path";
import { FileProtocol, FileRepository } from "../../lib/repo/FileRepository";
import { RepositoryOptions } from "../../lib/repo/Repository";

export type ConfigRepositoryOptions = RepositoryOptions<Config, false> & {
  rAthenaPath: string;
  configName: string;
};

export class ConfigRepository extends FileRepository<Config, true> {
  constructor(options: ConfigRepositoryOptions) {
    super({
      ...options,
      defaultValue: options.defaultValue ?? {},
      directory: path.resolve(options.rAthenaPath, "conf"),
      relativeFilename: options.configName,
      protocol: configFileProtocol,
    });
  }
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
