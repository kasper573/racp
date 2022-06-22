import { ZodType } from "zod";

function buildRpcDefinitionsImpl<Definitions extends RpcDefinitions>(
  definitions: Definitions
): RpcDefinitionBuilder<Definitions> {
  return {
    definitions: definitions,
    query(name, argument, result, options) {
      return buildRpcDefinitionsImpl({
        ...definitions,
        [name]: { argument, result, intent: "query", ...options },
      });
    },
    mutation(name, argument, result, options) {
      return buildRpcDefinitionsImpl({
        ...definitions,
        [name]: { argument, result, intent: "mutation", ...options },
      });
    },
  };
}

export function createRpcDefinitions<Final extends RpcDefinitions>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  build: (builder: RpcDefinitionBuilder<{}>) => RpcDefinitionBuilder<Final>
) {
  return build(buildRpcDefinitionsImpl({})).definitions;
}

export type RpcIntent = "mutation" | "query";

export type RpcDefinitions = Record<string, RpcDefinition>;

export interface RpcDefinitionBuilder<Current extends RpcDefinitions> {
  definitions: Current;
  query<Name extends string, Argument, Result>(
    name: Name,
    argument: ZodType<Argument>,
    result: ZodType<Result>,
    options?: RpcDefinitionOptions<Result>
  ): RpcDefinitionBuilder<
    Current & {
      [K in Name]: RpcDefinition<Argument, Result, "query">;
    }
  >;
  mutation<Name extends string, Argument, Result>(
    name: Name,
    argument: ZodType<Argument>,
    result: ZodType<Result>,
    options?: RpcDefinitionOptions<Result>
  ): RpcDefinitionBuilder<
    Current & {
      [K in Name]: RpcDefinition<Argument, Result, "mutation">;
    }
  >;
}

export type RpcDefinitionOptions<Result> = Partial<{
  auth: boolean;
}>;

export interface RpcDefinition<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Argument = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Result = any,
  Intent extends RpcIntent = RpcIntent
> extends RpcDefinitionOptions<Result> {
  argument: ZodType<Argument>;
  result: ZodType<Result>;
  intent: Intent;
}
