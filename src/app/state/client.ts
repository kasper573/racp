import { createTRPCReact, httpBatchLink } from "@trpc/react";
import { ApiRouter } from "../../api/services/router";

export const trpc = createTRPCReact<ApiRouter>();

export function createTRPCClient(getToken: () => string | undefined) {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: process.env.apiBaseUrl!,
        headers() {
          const token = getToken();
          if (token) {
            return {
              Authorization: `Bearer ${token}`,
            };
          }
          return {};
        },
      }),
    ],
  });
}

export const useCountItemImagesQuery = trpc.item.countItemImages.useQuery;
export const useUploadItemImagesMutation =
  trpc.item.uploadItemImages.useMutation;
export const useGetItemQuery = trpc.item.getItem.useQuery;
export const useSearchItemsQuery = trpc.item.searchItems.useQuery;
export const useCountItemInfoQuery = trpc.item.countItemInfo.useQuery;
export const useUploadItemInfoMutation = trpc.item.uploadItemInfo.useMutation;
export const useGetItemsMissingImagesQuery =
  trpc.item.getItemsMissingImages.useQuery;

export const useLoginMutation = trpc.user.login.useMutation;
export const useRegisterMutation = trpc.user.register.useMutation;
export const useUpdateMyProfileMutation = trpc.user.updateMyProfile.useMutation;
export const useGetMyProfileQuery = trpc.user.getMyProfile.useQuery;

export const useListConfigsQuery = trpc.config.listConfigs.useQuery;
export const useGetConfigQuery = trpc.config.getConfig.useQuery;
export const useUpdateConfigMutation = trpc.config.updateConfig.useMutation;

export const useSearchMonstersQuery = trpc.monster.searchMonsters.useQuery;
export const useUploadMonsterImagesMutation =
  trpc.monster.uploadMonsterImages.useMutation;
export const useGetMonstersMissingImagesQuery =
  trpc.monster.getMonstersMissingImages.useQuery;
export const useSearchMonsterSpawnsQuery =
  trpc.monster.searchMonsterSpawns.useQuery;

export const useSearchMapsQuery = trpc.map.searchMaps.useQuery;
export const useGetMapQuery = trpc.map.getMap.useQuery;
export const useCountMapBoundsQuery = trpc.map.countMapBounds.useQuery;
export const useSearchWarpsQuery = trpc.map.searchWarps.useQuery;
export const useUploadMapInfoMutation = trpc.map.uploadMapInfo.useMutation;
export const useUploadMapImagesMutation = trpc.map.uploadMapImages.useMutation;
export const useUpdateMapBoundsMutation = trpc.map.updateMapBounds.useMutation;
export const useCountMapImagesQuery = trpc.map.countMapImages.useQuery;
export const useCountMapInfoQuery = trpc.map.countMapInfo.useQuery;
export const useGetMissingMapDataQuery = trpc.map.getMissingMapData.useQuery;

export const useDecompileLuaTableFilesMutation =
  trpc.util.decompileLuaTableFiles.useMutation;

export const useGetMetaQuery = trpc.meta.getMeta.useQuery;
