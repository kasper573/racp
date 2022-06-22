import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { serviceDefinition } from "../api/service.definition";
import { createRpcEndpoints } from "../utils/rpc/createRpcEndpoints";
import { AppState } from "./store";

export const client = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.app_apiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const { username, password } = (getState() as AppState).auth.credentials;
      headers.set("Authorization", `Basic ${btoa(`${username}:${password}`)}`);
      return headers;
    },
  }),
  endpoints: (builder) => createRpcEndpoints(builder, serviceDefinition),
});

export const { useListQuery, useAddMutation, useRemoveMutation } = client;
