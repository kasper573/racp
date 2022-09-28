import { createTRPCReact } from "@trpc/react";
import { ApiRouter } from "../../api/services/router";

export const client = createTRPCReact<ApiRouter>();

export const useCountItemImagesQuery = client.item.countItemImages.useQuery;
export const useUploadItemImagesMutation =
  client.item.uploadItemImages.useMutation;
export const useGetItemQuery = client.item.getItem.useQuery;
export const useSearchItemsQuery = client.item.searchItems.useQuery;
export const useCountItemInfoQuery = client.item.countItemInfo.useQuery;
export const useUploadItemInfoMutation = client.item.uploadItemInfo.useMutation;
export const useUploadMapImagesMutation =
  client.item.uploadItemImages.useMutation;
export const useGetItemsMissingImagesQuery =
  client.item.getItgemsMissingImages.useQuery;

export const useLoginMutation = client.user.login.useMutation;
export const useRegisterMutation = client.user.register.useMutation;
export const useUpdateMyProfileMutation =
  client.user.updateMyProfile.useMutation;
export const useGetMyProfileQuery = client.user.getMyProfile.useQuery;

export const useListConfigsQuery = client.config.listConfigs.useQuery;
export const useGetConfigQuery = client.config.getConfig.useQuery;
export const useUpdateConfigMutation = client.config.updateConfig.useQuery;

export const useSearchMonstersQuery = client.monster.searchMonsters.useQuery;
export const useUploadMonsterImagesMutation =
  client.monster.uploadMonsterImages.useMutation;
export const useGetMonstersMissingImagesQuery =
  client.monster.getMonstersMissingImages.useQuery;
export const useSearchMonsterSpawnsQuery =
  client.monster.searchMonsterSpawns.useQuery;

export const useSearchMapsQuery = client.map.searchMaps.useQuery;
export const useGetMapQuery = client.map.getMap.useQuery;
export const useCountMapBoundsQuery = client.map.countMapBounds.useQuery;
export const useSearchWarpsQuery = client.map.searchWarps.useQuery;
export const useUploadMapInfoMutation = client.map.uploadMapInfo.useMutation;
export const useUpdateMapBoundsMutation =
  client.map.uploadMapBounds.useMutation;
export const useCountMapImagesQuery = client.map.countMapImages.useQuery;
export const useCountMapInfoQuery = client.map.countMapInfo.useQuery;
export const useGetMissingMapDataQuery = client.map.getMissingMapData.useQuery;

export const useDecompileLuaTableFilesMutation =
  client.util.decompileLuaTableFiles.useMutation;

export const useGetMetaQuery = client.meta.getMeta.useQuery;
