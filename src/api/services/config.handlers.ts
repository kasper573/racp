import * as fs from "fs";
import * as path from "path";
import recursiveReadDir = require("recursive-readdir");
import { createRpcHandlers } from "../../lib/rpc/createRpcHandlers";
import { RpcException } from "../../lib/rpc/RpcException";
import { configDefinition } from "./config.definition";

export function createConfigHandlers(rAthenaPath: string) {
  const configDirectory = path.resolve(rAthenaPath, "conf");
  const configPath = (configName: string) =>
    path.resolve(configDirectory, configName);

  return createRpcHandlers(configDefinition.entries, {
    async listConfigs() {
      const files = await recursiveReadDir(configDirectory);
      return files.map((file) => path.relative(configDirectory, file));
    },
    async getConfig(configName) {
      try {
        return fs.readFileSync(configPath(configName), "utf-8");
      } catch {
        throw new RpcException("Unknown config");
      }
    },
    async updateConfig({ name, content }) {
      const path = configPath(name);
      if (!fs.existsSync(path)) {
        throw new RpcException("Unknown config");
      }
      fs.writeFileSync(path, content);
    },
  });
}
