import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { configDefinition } from "../../api/services/config/definition";
import { createRpcEndpoints } from "../../lib/rpc/createRpcEndpoints";
import { authDefinition } from "../../api/services/auth/definition";
import { itemDefinition } from "../../api/services/item/definition";
import { monsterDefinition } from "../../api/services/monster/definition";
import { metaDefinition } from "../../api/services/meta/definition";
import { mapDefinition } from "../../api/services/map/definition";
import { utilDefinition } from "../../api/services/util/definition";
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
    ...metaDefinition.tagTypes,
    ...configDefinition.tagTypes,
    ...authDefinition.tagTypes,
    ...itemDefinition.tagTypes,
    ...monsterDefinition.tagTypes,
    ...mapDefinition.tagTypes,
    ...utilDefinition.tagTypes,
  ],
  endpoints: (builder) => ({
    ...createRpcEndpoints(builder, metaDefinition.entries),
    ...createRpcEndpoints(builder, configDefinition.entries),
    ...createRpcEndpoints(builder, authDefinition.entries),
    ...createRpcEndpoints(builder, itemDefinition.entries),
    ...createRpcEndpoints(builder, monsterDefinition.entries),
    ...createRpcEndpoints(builder, mapDefinition.entries),
    ...createRpcEndpoints(builder, utilDefinition.entries),
  }),
});

export const {
  useGetMyProfileQuery,
  useGetMetaQuery,
  useGetItemQuery,
  useSearchItemsQuery,
  useListConfigsQuery,
  useGetConfigQuery,
  useSearchMonstersQuery,
  useCountItemInfoQuery,
  useUpdateConfigMutation,
  useUploadItemInfoMutation,
  useUploadMapImagesMutation,
  useUploadMonsterImagesMutation,
  useGetMonstersMissingImagesQuery,
  useSearchMapsQuery,
  useSearchMonsterSpawnsQuery,
  useDecompileLuaTableFilesMutation,
  useGetMapQuery,
  useCountMapBoundsQuery,
  useSearchWarpsQuery,
  useUploadMapInfoMutation,
  useUpdateMapBoundsMutation,
  useCountMapImagesQuery,
  useCountMapInfoQuery,
  useGetMissingMapDataQuery,
  useLoginMutation,
} = client;
