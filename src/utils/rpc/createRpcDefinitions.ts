import { ZodType } from "zod";

export function createRpcDefinitions<T extends RpcDefinitions>(
  definitions: T
): T {
  return definitions;
}

export type RpcIntent = "mutation" | "query";

export type RpcDefinitions = Record<string, RpcDefinition>;

export interface RpcDefinition<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Argument extends ZodType = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Result extends ZodType = any,
  Intent extends RpcIntent = RpcIntent
> {
  argument: Argument;
  result: Result;
  intent: Intent;
}
