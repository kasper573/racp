import { createRpcHandlers } from "../../../lib/rpc/createRpcHandlers";
import { RpcException } from "../../../lib/rpc/RpcException";
import { RACFG } from "../racfg";
import { configDefinition } from "./config.definition";

export function createConfigHandlers(cfg: RACFG) {
  return createRpcHandlers(configDefinition.entries, {
    listConfigs: cfg.list,
    async getConfig(configName) {
      try {
        return await cfg.read(configName);
      } catch {
        throw new RpcException("Unknown config");
      }
    },
    async updateConfig({ name, content }) {
      try {
        await cfg.update(name, content);
      } catch {
        throw new RpcException("Unknown config");
      }
    },
  });
}
