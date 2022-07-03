import * as path from "path";
import * as fs from "fs";
import recursiveReadDir = require("recursive-readdir");

// rAthena config system
export type RACFG = ReturnType<typeof createRACFG>;

export function createRACFG(rAthenaPath: string) {
  const configDirectory = path.resolve(rAthenaPath, "conf");
  const configPath = (configName: string) =>
    path.resolve(configDirectory, configName);

  async function list() {
    const files = await recursiveReadDir(configDirectory);
    return files.map((file) => path.relative(configDirectory, file));
  }

  async function load(configName: string) {
    return fs.promises.readFile(configPath(configName), "utf-8");
  }

  function parse(config: string): Record<string, string> {
    return {};
  }

  async function get(configName: string) {
    return parse(await load(configName));
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
      return fs.promises.writeFile(configPath(configName), value);
    }
    throw new Error(`Unknown config`);
  }

  return {
    list,
    load,
    exists,
    update,
    parse,
    get,
  };
}
