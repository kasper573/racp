import { createRpcController } from "../../../lib/rpc/createRpcController";
import { RpcException } from "../../../lib/rpc/RpcException";
import { RAConfigDriver } from "../../../lib/rathena/RAConfigDriver";
import { configDefinition } from "./definition";

export function configController(cfg: RAConfigDriver) {
  return createRpcController(configDefinition.entries, {
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
