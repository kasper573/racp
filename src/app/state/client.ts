import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { configDefinition } from "../../api/services/config/config.definition";
import { createRpcEndpoints } from "../../lib/rpc/createRpcEndpoints";
import { authDefinition } from "../../api/services/auth/auth.definition";
import { itemDefinition } from "../../api/services/item/item.definition";
import { AppState } from "./store";

export const client = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.apiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const { token } = (getState() as AppState).auth;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    ...configDefinition.tagTypes,
    ...authDefinition.tagTypes,
    ...itemDefinition.tagTypes,
  ],
  endpoints: (builder) => ({
    ...createRpcEndpoints(builder, configDefinition.entries),
    ...createRpcEndpoints(builder, authDefinition.entries),
    ...createRpcEndpoints(builder, itemDefinition.entries),
  }),
});

export const {
  useGetItemMetaQuery,
  useGetItemQuery,
  useSearchItemsQuery,
  useListConfigsQuery,
  useGetConfigQuery,
  useUpdateConfigMutation,
  useLoginMutation,
} = client;