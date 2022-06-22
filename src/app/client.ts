import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { apiBaseUrl } from "../shared/env";
import { apiServiceDefinition } from "../shared/apiServiceDefinition";
import { createRpcEndpoints } from "../utils/rpc/createRpcEndpoints";

export const client = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  endpoints: (builder) => createRpcEndpoints(builder, apiServiceDefinition),
});

export const { useGetHelloQuery } = client;
