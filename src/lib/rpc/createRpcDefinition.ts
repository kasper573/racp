import { ZodType } from "zod";
import { ResultDescription } from "@reduxjs/toolkit/src/query/endpointDefinitions";
import * as zod from "zod";
import { RpcFile } from "./RpcFile";

function buildRpcDefinition<
  Auth,
  TagTypes extends string,
  Entries extends RpcDefinitionEntries
>(
  tagTypes: TagTypes[],
  entries: Entries,
  inheritedOptions?: RpcDefinitionOptions<Auth>
): RpcDefinition<Auth, Entries, TagTypes> {
  return {
    entries,
    tagTypes,
    query(name, argument, result, options) {
      return buildRpcDefinition(
        tagTypes,
        {
          ...entries,
          [name]: {
            argument,
            result,
            intent: "query",
            ...inheritedOptions,
            ...options,
          },
        },
        inheritedOptions
      );
    },
    mutation(name, argument, result, options) {
      return buildRpcDefinition(
        tagTypes,
        {
          ...entries,
          [name]: {
            argument,
            result,
            intent: "mutation",
            ...inheritedOptions,
            ...options,
          },
        },
        inheritedOptions
      );
    },
    fileUpload(name, result, options) {
      return buildRpcDefinition(
        tagTypes,
        {
          ...entries,
          [name]: {
            argument: zod.any(), // Using any because the argument type is never used in runtime for file uploads
            result,
            intent: "fileUpload",
            ...inheritedOptions,
            ...options,
          },
        },
        inheritedOptions
      );
    },
  };
}

export function createRpcDefinitionFactory<Auth>(
  defaultOptions: RpcDefinitionOptions<Auth>
) {
  function rpcFactory<
    TagTypes extends string,
    Entries extends RpcDefinitionEntries
  >({
    tagTypes = [],
    entries,
    ...options
  }: RpcDefinitionOptions<Auth> & {
    tagTypes?: TagTypes[];
    entries: (
      // eslint-disable-next-line @typescript-eslint/ban-types
      builder: RpcDefinition<Auth, {}, TagTypes>
    ) => RpcDefinition<Auth, Entries, TagTypes>;
  }) {
    return entries(
      buildRpcDefinition(tagTypes, {}, { ...defaultOptions, ...options })
    );
  }

  return rpcFactory;
}

export type RpcIntent = "mutation" | "query" | "fileUpload";

export type RpcDefinitionFor<Entries> = Entries extends RpcDefinitionEntries
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RpcDefinition<any, Entries, any>
  : never;

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
  fileUpload<Name extends string, Result>(
    name: Name,
    result: ZodType<Result>,
    options?: RpcDefinitionEntryOptions<Auth, TagTypes, RpcFile[], Result>
  ): RpcDefinition<
    Auth,
    Entries & {
      [K in Name]: RpcDefinitionEntry<
        Auth,
        TagTypes,
        RpcFile[],
        Result,
        "fileUpload"
      >;
    },
    TagTypes
  >;
}

export type RpcDefinitionEntries = Record<string, RpcDefinitionEntry>;

export interface RpcDefinitionOptions<Auth> {
  auth?: Auth;
  requestBodySizeLimit?: number;
}

export type RpcDefinitionEntryOptions<
  Auth,
  TagTypes extends string,
  Argument,
  Result
> = RpcDefinitionOptions<Auth> &
  Partial<{
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
