import { RpcDefinition, RpcDefinitions } from "./createRpcDefinitions";

export function createRpcHandlers<Definitions extends RpcDefinitions>(
  definitions: Definitions,
  handlers: RpcHandlers<Definitions>
) {
  return handlers;
}

export type RpcHandlers<Definitions extends RpcDefinitions> = {
  [K in keyof Definitions]: RpcHandler<Definitions[K]>;
};

export type RpcHandler<Definition extends RpcDefinition> = (
  argument: Definition["argument"]["_type"]
) => Definition["result"]["_type"];
