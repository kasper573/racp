import * as path from "path";
import recursiveReadDir = require("recursive-readdir");
import { Logger } from "../../lib/logger";
import { gfs } from "../gfs";

export type ConfigDriver = ReturnType<typeof createConfigDriver>;

export const dbInfoConfigName = "inter_athena.conf";

export function createConfigDriver({
  rAthenaPath,
  logger: parentLogger,
}: {
  rAthenaPath: string;
  logger: Logger;
}) {
  const logger = parentLogger.chain("config");
  const configDirectory = path.resolve(rAthenaPath, "conf");
  const configPath = (configName: string) =>
    path.resolve(configDirectory, configName);

  const list = logger.wrap(async function list() {
    const files = await recursiveReadDir(configDirectory);
    return files.map((file) => path.relative(configDirectory, file));
  });

  const read = logger.wrap(async function read(configName: string) {
    return gfs.readFile(configPath(configName), "utf-8");
  });

  const load = logger.wrap(async function load(configName: string) {
    const record = await parse(await read(configName));
    return {
      get(key: string) {
        if (key in record) {
          return record[key];
        }
        throw new Error(
          `Config "${configName}" does not contain a "${key}" key`
        );
      },
      update(...[values]: Parameters<typeof format>) {
        Object.assign(record, values);
        return update(configName, format(record));
      },
    };
  });

  const update = logger.wrap(async function update(
    configName: string,
    value: string
  ) {
    try {
      return gfs.writeFile(configPath(configName), value);
    } catch {
      throw new Error(`Unknown config`);
    }
  });

  const presets = {
    dbInfoConfigName,
    createDBInfo,
    async dbInfo(prefix: string) {
      return createDBInfo(await load(dbInfoConfigName), prefix);
    },
  };

  return {
    list,
    read,
    update,
    parse,
    load,
    presets,
  };
}

function createDBInfo(
  config: { get: (key: string) => string },
  prefix: string
) {
  return {
    get host() {
      return config.get(`${prefix}_ip`);
    },
    get port() {
      return parseInt(config.get(`${prefix}_port`), 10);
    },
    get user() {
      return config.get(`${prefix}_id`);
    },
    get password() {
      return config.get(`${prefix}_pw`);
    },
    get database() {
      return config.get(`${prefix}_db`);
    },
  };
}

function format(config: Record<string, unknown>) {
  return Object.entries(config)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function parse(config: string) {
  const matches = config
    .replaceAll(/\/\/.*$/gm, "")
    .matchAll(/^([\w_]+):(.*)/gm);
  return Array.from(matches).reduce((record, [, key, value]) => {
    record[key.trim()] = value.trim();
    return record;
  }, {} as Record<string, string>);
}
