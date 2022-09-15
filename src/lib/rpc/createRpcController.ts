import {
  RpcDefinitionEntry,
  RpcDefinitionEntries,
} from "./createRpcDefinition";

export function createRpcControllerFactory<Context>() {
  return function createRpcController<Entries extends RpcDefinitionEntries>(
    entries: Entries,
    controller: RpcController<Entries, Context>
  ) {
    return controller;
  };
}

export type RpcController<Entries extends RpcDefinitionEntries, Context> = {
  [K in keyof Entries]: RpcHandler<Entries[K], Context>;
};

export type RpcHandler<Entry extends RpcDefinitionEntry, Context> = (
  argument: Entry["argument"]["_type"],
  context: Context
) => Promise<Entry["result"]["_type"]>;
