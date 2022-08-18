import * as path from "path";
import * as fs from "fs";
import { replaceObject } from "../../../lib/replaceEntries";
import { FileStore } from "../../../lib/createFileStore";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { Linker } from "../../../lib/createPublicFileLinker";
import { MapId, MapInfo, MapInfoPostProcess, mapInfoType } from "./types";

export type MapRepository = ReturnType<typeof createMapRepository>;

export function createMapRepository({
  files,
  linker,
}: {
  files: FileStore;
  linker: Linker;
}) {
  const info: Record<string, MapInfo> = {};

  const mapLinker = linker.chain("mapImages");
  const mapImageUrl = (mapId: string) => mapLinker.url(`${mapId}.bmp`);

  const infoFile = files.entry("mapInfo.lub", parseMapInfo, (newInfo) =>
    replaceObject(info, postProcessMapInfo(newInfo ?? {}, mapImageUrl))
  );

  return {
    info,
    updateInfo: infoFile.update,
    countImages: () => fs.readdirSync(mapLinker.directory).length,
    updateImages: async (files: Array<{ name: string; data: Uint8Array }>) => {
      const all = await Promise.allSettled(
        files.map((file) =>
          fs.promises.writeFile(
            path.resolve(mapLinker.directory, path.basename(file.name)),
            file.data
          )
        )
      );
      const success = all.filter((r) => r.status === "fulfilled").length;
      const failed = all.length - success;
      return { success, failed };
    },
  };
}

const parseMapInfo = (luaCode: string) => parseLuaTableAs(luaCode, mapInfoType);

const trimExtension = (id: string) => id.replace(/\.[^.]+$/, "");

function postProcessMapInfo(
  lookup: Record<string, MapInfo>,
  getImageUrl: MapImageUrlResolver
): Record<string, MapInfo> {
  return Object.entries(lookup ?? {}).reduce((updated, [key, info]) => {
    const id = trimExtension(key);
    const post: MapInfoPostProcess = {
      id,
      imageUrl: getImageUrl(id),
    };
    return { ...updated, [id]: { ...info, ...post } };
  }, {});
}

export type MapImageUrlResolver = (id: MapId) => string;
