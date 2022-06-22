import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { serviceDefinition } from "../api/service.definition";
import { createRpcEndpoints } from "../utils/rpc/createRpcEndpoints";
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
  endpoints: (builder) => createRpcEndpoints(builder, serviceDefinition),
});

export const {
  useListQuery,
  useAddMutation,
  useRemoveMutation,
  useLoginMutation,
} = client;
