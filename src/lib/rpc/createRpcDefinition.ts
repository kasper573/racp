import { ZodType } from "zod";
import { ResultDescription } from "@reduxjs/toolkit/src/query/endpointDefinitions";

function buildRpcDefinitionImpl<
  TagTypes extends string,
  Entries extends RpcDefinitionEntries
>(tagTypes: TagTypes[], entries: Entries): RpcDefinition<Entries, TagTypes> {
  return {
    entries,
    tagTypes,
    query(name, argument, result, options) {
      return buildRpcDefinitionImpl(tagTypes, {
        ...entries,
        [name]: { argument, result, intent: "query", ...options },
      });
    },
    mutation(name, argument, result, options) {
      return buildRpcDefinitionImpl(tagTypes, {
        ...entries,
        [name]: { argument, result, intent: "mutation", ...options },
      });
    },
  };
}

export function createRpcDefinition<
  TagTypes extends string,
  Entries extends RpcDefinitionEntries
>({
  tagTypes = [],
  entries,
}: {
  tagTypes?: TagTypes[];
  entries: (
    // eslint-disable-next-line @typescript-eslint/ban-types
    builder: RpcDefinition<{}, TagTypes>
  ) => RpcDefinition<Entries, TagTypes>;
}) {
  return entries(buildRpcDefinitionImpl(tagTypes, {}));
}

export type RpcIntent = "mutation" | "query";

export interface RpcDefinition<
  Entries extends RpcDefinitionEntries,
  TagTypes extends string
> {
  readonly entries: Entries;
  readonly tagTypes: TagTypes[];
  query<Name extends string, Argument, Result>(
    name: Name,
    argument: ZodType<Argument>,
    result: ZodType<Result>,
    options?: RpcDefinitionEntryOptions<TagTypes, Argument, Result>
  ): RpcDefinition<
    Entries & {
      [K in Name]: RpcDefinitionEntry<TagTypes, Argument, Result, "query">;
    },
    TagTypes
  >;
  mutation<Name extends string, Argument, Result>(
    name: Name,
    argument: ZodType<Argument>,
    result: ZodType<Result>,
    options?: RpcDefinitionEntryOptions<TagTypes, Argument, Result>
  ): RpcDefinition<
    Entries & {
      [K in Name]: RpcDefinitionEntry<TagTypes, Argument, Result, "mutation">;
    },
    TagTypes
  >;
}

export type RpcDefinitionEntries = Record<string, RpcDefinitionEntry>;

export type RpcDefinitionEntryOptions<
  TagTypes extends string,
  Argument,
  Result
> = Partial<{
  auth: boolean;
  tags: ResultDescription<TagTypes, Result, Argument, unknown, unknown>;
}>;

export interface RpcDefinitionEntry<
  TagTypes extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Argument = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Result = any,
  Intent extends RpcIntent = RpcIntent
> extends RpcDefinitionEntryOptions<TagTypes, Argument, Result> {
  argument: ZodType<Argument>;
  result: ZodType<Result>;
  intent: Intent;
}
