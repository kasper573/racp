import * as path from "path";
import * as fs from "fs";
import { replaceObject } from "../../../lib/replaceEntries";
import { FileStore } from "../../../lib/createFileStore";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { Linker } from "../../../lib/createPublicFileLinker";
import { ImageFormatter } from "../../../lib/createImageFormatter";
import { MapId, MapInfo, MapInfoPostProcess, mapInfoType } from "./types";
export type MapRepository = ReturnType<typeof createMapRepository>;

export function createMapRepository({
  files,
  linker,
  formatter,
}: {
  files: FileStore;
  linker: Linker;
  formatter: ImageFormatter;
}) {
  const info: Record<string, MapInfo> = {};

  const mapLinker = linker.chain("mapImages");
  const mapImageName = (mapId: string) => `${mapId}${formatter.fileExtension}`;
  const mapImageUrl = (mapId: string) => mapLinker.url(mapImageName(mapId));
  const mapImagePath = (mapId: string) => mapLinker.path(mapImageName(mapId));

  const infoFile = files.entry("mapInfo.lub", parseMapInfo, (newInfo) =>
    replaceObject(info, postProcessMapInfo(newInfo ?? {}, mapImageUrl))
  );

  return {
    info,
    updateInfo: infoFile.update,
    countImages: () => fs.readdirSync(mapLinker.directory).length,
    async hasImage(mapId: MapId) {
      return fs.promises
        .access(mapImagePath(mapId))
        .then(() => true)
        .catch(() => false);
    },
    updateImages: async (files: Array<{ name: string; data: Uint8Array }>) => {
      const all = await Promise.allSettled(
        files.map((file) =>
          formatter.write(
            mapLinker.path(path.basename(file.name)),
            Buffer.from(file.data)
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
