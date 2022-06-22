import { BaseQueryFn } from "@reduxjs/toolkit/query";
import {
  EndpointBuilder,
  MutationDefinition,
  QueryDefinition,
} from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { typedKeys } from "../typedKeys";
import { RpcDefinition, RpcDefinitions } from "./createRpcDefinitions";

export function createRpcEndpoints<
  BaseQuery extends BaseQueryFn<RpcQueryArgs>,
  TagTypes extends string,
  ReducerPath extends string,
  Definitions extends RpcDefinitions
>(
  builder: EndpointBuilder<BaseQuery, TagTypes, ReducerPath>,
  definitions: Definitions
) {
  type RPCEndpoint<T extends RpcDefinition> = {
    query: QueryDefinition<
      T["argument"]["_type"],
      BaseQuery,
      TagTypes,
      T["result"]["_type"],
      ReducerPath
    >;
    mutation: MutationDefinition<
      T["argument"]["_type"],
      BaseQuery,
      TagTypes,
      T["result"]["_type"],
      ReducerPath
    >;
  }[T["intent"]];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const endpoints = {} as Record<keyof Definitions, RPCEndpoint<any>>;

  for (const endpointName of typedKeys(definitions)) {
    const { intent } = definitions[endpointName];

    endpoints[endpointName] = builder[intent](
      {
        query: (arg: unknown) => {
          const args: RpcQueryArgs = {
            url: createEndpointUrl(endpointName),
            method: "post",
            body: JSON.stringify(arg),
          };
          return args;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any // Sad assert since I can't make EndpointBuilder accept this
    );
  }

  return endpoints as {
    [K in keyof Definitions]: RPCEndpoint<Definitions[K]>;
  };
}

export const createEndpointUrl = String;

export interface RpcQueryArgs extends RequestInit {
  url: string;
}
