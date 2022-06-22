import { ZodType } from "zod";

function buildRpcDefinitionImpl<Entries extends RpcDefinitionEntries>(
  entries: Entries
): RpcDefinition<Entries> {
  return {
    entries,
    query(name, argument, result, options) {
      return buildRpcDefinitionImpl({
        ...entries,
        [name]: { argument, result, intent: "query", ...options },
      });
    },
    mutation(name, argument, result, options) {
      return buildRpcDefinitionImpl({
        ...entries,
        [name]: { argument, result, intent: "mutation", ...options },
      });
    },
  };
}

export function createRpcDefinition<Entries extends RpcDefinitionEntries>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  build: (builder: RpcDefinition<{}>) => RpcDefinition<Entries>
) {
  return build(buildRpcDefinitionImpl({}));
}

export type RpcIntent = "mutation" | "query";

export interface RpcDefinition<Entries extends RpcDefinitionEntries> {
  readonly entries: Entries;
  query<Name extends string, Argument, Result>(
    name: Name,
    argument: ZodType<Argument>,
    result: ZodType<Result>,
    options?: RpcDefinitionEntryOptions<Result>
  ): RpcDefinition<
    Entries & {
      [K in Name]: RpcDefinitionEntry<Argument, Result, "query">;
    }
  >;
  mutation<Name extends string, Argument, Result>(
    name: Name,
    argument: ZodType<Argument>,
    result: ZodType<Result>,
    options?: RpcDefinitionEntryOptions<Result>
  ): RpcDefinition<
    Entries & {
      [K in Name]: RpcDefinitionEntry<Argument, Result, "mutation">;
    }
  >;
}

export type RpcDefinitionEntries = Record<string, RpcDefinitionEntry>;

export type RpcDefinitionEntryOptions<Result> = Partial<{
  auth: boolean;
}>;

export interface RpcDefinitionEntry<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Argument = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Result = any,
  Intent extends RpcIntent = RpcIntent
> extends RpcDefinitionEntryOptions<Result> {
  argument: ZodType<Argument>;
  result: ZodType<Result>;
  intent: Intent;
}
