import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { configDefinition } from "../api/services/config.definition";
import { createRpcEndpoints } from "../utils/rpc/createRpcEndpoints";
import { authDefinition } from "../api/services/auth.definition";
import { AppState } from "./store";

export const client = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.app_apiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const { token } = (getState() as AppState).auth;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    ...createRpcEndpoints(builder, configDefinition.entries),
    ...createRpcEndpoints(builder, authDefinition.entries),
  }),
});

export const {
  useListConfigsQuery,
  useGetConfigQuery,
  useUpdateConfigMutation,
  useLoginMutation,
} = client;
