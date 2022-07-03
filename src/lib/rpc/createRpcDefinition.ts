import { ZodType } from "zod";
import { ResultDescription } from "@reduxjs/toolkit/src/query/endpointDefinitions";

function buildRpcDefinition<
  Auth,
  TagTypes extends string,
  Entries extends RpcDefinitionEntries
>(
  tagTypes: TagTypes[],
  entries: Entries,
  inheritedAuth?: Auth
): RpcDefinition<Auth, Entries, TagTypes> {
  return {
    entries,
    tagTypes,
    query(name, argument, result, options) {
      return buildRpcDefinition(tagTypes, {
        ...entries,
        [name]: {
          argument,
          result,
          intent: "query",
          ...options,
          auth: options?.auth ?? inheritedAuth,
        },
      });
    },
    mutation(name, argument, result, options) {
      return buildRpcDefinition(tagTypes, {
        ...entries,
        [name]: {
          argument,
          result,
          intent: "mutation",
          ...options,
          auth: options?.auth ?? inheritedAuth,
        },
      });
    },
  };
}

export function createRpcDefinitionFactory<Auth>(defaultAuth: Auth) {
  function rpcFactory<
    TagTypes extends string,
    Entries extends RpcDefinitionEntries
  >({
    auth,
    tagTypes = [],
    entries,
  }: {
    auth?: Auth;
    tagTypes?: TagTypes[];
    entries: (
      // eslint-disable-next-line @typescript-eslint/ban-types
      builder: RpcDefinition<Auth, {}, TagTypes>
    ) => RpcDefinition<Auth, Entries, TagTypes>;
  }) {
    return entries(buildRpcDefinition(tagTypes, {}, auth ?? defaultAuth));
  }

  return rpcFactory;
}

export type RpcIntent = "mutation" | "query";

export interface RpcDefinition<
  Auth,
  Entries extends RpcDefinitionEntries,
  TagTypes extends string
> {
  readonly entries: Entries;
  readonly tagTypes: TagTypes[];
  query<Name extends string, Argument, Result>(
    name: Name,
    argument: ZodType<Argument>,
    result: ZodType<Result>,
    options?: RpcDefinitionEntryOptions<Auth, TagTypes, Argument, Result>
  ): RpcDefinition<
    Auth,
    Entries & {
      [K in Name]: RpcDefinitionEntry<
        Auth,
        TagTypes,
        Argument,
        Result,
        "query"
      >;
    },
    TagTypes
  >;
  mutation<Name extends string, Argument, Result>(
    name: Name,
    argument: ZodType<Argument>,
    result: ZodType<Result>,
    options?: RpcDefinitionEntryOptions<Auth, TagTypes, Argument, Result>
  ): RpcDefinition<
    Auth,
    Entries & {
      [K in Name]: RpcDefinitionEntry<
        Auth,
        TagTypes,
        Argument,
        Result,
        "mutation"
      >;
    },
    TagTypes
  >;
}

export type RpcDefinitionEntries = Record<string, RpcDefinitionEntry>;

export type RpcDefinitionEntryOptions<
  Auth,
  TagTypes extends string,
  Argument,
  Result
> = Partial<{
  auth: Auth;
  tags: ResultDescription<TagTypes, Result, Argument, unknown, unknown>;
}>;

export interface RpcDefinitionEntry<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AuthOptions = any,
  TagTypes extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Argument = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Result = any,
  Intent extends RpcIntent = RpcIntent
> extends RpcDefinitionEntryOptions<AuthOptions, TagTypes, Argument, Result> {
  argument: ZodType<Argument>;
  result: ZodType<Result>;
  intent: Intent;
}
