import * as path from "path";
import * as fs from "fs";
import recursiveReadDir = require("recursive-readdir");
import { Logger } from "../util/logger";

export type ConfigDriver = ReturnType<typeof createConfigDriver>;

export const dbInfoConfigName = "inter_athena.conf";

export function createConfigDriver({
  rAthenaPath,
  logger,
}: {
  rAthenaPath: string;
  logger: Logger;
}) {
  const configDirectory = path.resolve(rAthenaPath, "conf");
  const configPath = (configName: string) =>
    path.resolve(configDirectory, configName);

  async function list() {
    return logger.logProcess(async () => {
      const files = await recursiveReadDir(configDirectory);
      return files.map((file) => path.relative(configDirectory, file));
    }, `Loading config list`);
  }

  async function read(configName: string) {
    return logger.logProcess(
      () => fs.promises.readFile(configPath(configName), "utf-8"),
      `Reading file ${configPath(configName)}`
    );
  }

  function parse(config: string) {
    const matches = config.matchAll(/^\s*(\w+):\s*(.*)\s*(\/\/)?/gm);
    return Array.from(matches).reduce(
      (record, [, key, value]) => ({ ...record, [key]: value }),
      {} as Record<string, string>
    );
  }

  async function load(configName: string) {
    const record = await logger.logProcess(
      async () => parse(await read(configName)),
      `Loading values in config "${configName}"`
    );
    return {
      get(key: string) {
        if (key in record) {
          return record[key];
        }
        throw new Error(
          `Config "${configName}" does not contain a "${key}" key`
        );
      },
    };
  }

  async function exists(configName: string) {
    try {
      await fs.promises.stat(configPath(configName));
      return true;
    } catch {
      return false;
    }
  }

  async function update(configName: string, value: string) {
    if (await exists(configName)) {
      return logger.logProcess(
        () => fs.promises.writeFile(configPath(configName), value),
        `Updating ${configName}`
      );
    }
    throw new Error(`Unknown config`);
  }

  const presets = {
    dbInfoConfigName,
    async dbInfo(prefix: string) {
      const info = await load(dbInfoConfigName);
      return {
        host: info.get(`${prefix}_ip`),
        port: parseInt(info.get(`${prefix}_port`), 10),
        user: info.get(`${prefix}_id`),
        password: info.get(`${prefix}_pw`),
        database: info.get(`${prefix}_db`),
      };
    },
  };

  return {
    list,
    read,
    exists,
    update,
    parse,
    load,
    presets,
  };
}
