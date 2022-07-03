import {
  RpcDefinitionEntry,
  RpcDefinitionEntries,
} from "./createRpcDefinition";

export function createRpcController<Entries extends RpcDefinitionEntries>(
  entries: Entries,
  controller: RpcController<Entries>
) {
  return controller;
}

export type RpcController<Entries extends RpcDefinitionEntries> = {
  [K in keyof Entries]: RpcHandler<Entries[K]>;
};

export type RpcHandler<Entry extends RpcDefinitionEntry> = (
  argument: Entry["argument"]["_type"]
) => Promise<Entry["result"]["_type"]>;
