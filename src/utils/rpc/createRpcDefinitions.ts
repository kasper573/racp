import { ZodType } from "zod";

export function createRpcDefinitions<T extends RpcDefinitions>(
  definitions: T
): T {
  return definitions;
}

export type RpcIntent = "mutation" | "query";

export type RpcDefinitions = Record<string, RpcDefinition>;

export interface RpcDefinition<
  Argument extends ZodType = ZodType,
  Result extends ZodType = ZodType,
  Intent extends RpcIntent = RpcIntent
> {
  argument: Argument;
  result: Result;
  intent: Intent;
  auth?: boolean;
}
