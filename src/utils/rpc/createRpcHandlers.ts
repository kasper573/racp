import {
  RpcDefinitionEntry,
  RpcDefinitionEntries,
} from "./createRpcDefinition";

export function createRpcHandlers<Entries extends RpcDefinitionEntries>(
  entries: Entries,
  handlers: RpcHandlers<Entries>
) {
  return handlers;
}

export type RpcHandlers<Entries extends RpcDefinitionEntries> = {
  [K in keyof Entries]: RpcHandler<Entries[K]>;
};

export type RpcHandler<Entry extends RpcDefinitionEntry> = (
  argument: Entry["argument"]["_type"]
) => Promise<Entry["result"]["_type"]>;
