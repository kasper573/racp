import * as path from "path";
import * as fs from "fs";
import { ensureDir } from "../../../lib/ensureDir";
import { replaceObject } from "../../../lib/replaceEntries";
import { FileStore } from "../../../lib/createFileStore";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { MapInfo, mapInfoType } from "./types";

export type MapRepository = ReturnType<typeof createMapRepository>;

export function createMapRepository(files: FileStore) {
  const imageDir = ensureDir(path.resolve(files.directory, "mapImages"));
  const info: Record<string, MapInfo> = {};

  const infoFile = files.entry("mapInfo.lub", parseMapInfo, (newInfo) =>
    replaceObject(info, populateMapIds(newInfo ?? {}))
  );

  return {
    info,
    updateInfo: infoFile.update,
    countImages: () => fs.readdirSync(imageDir).length,
    updateImages: async (files: Array<{ name: string; data: Uint8Array }>) => {
      const all = await Promise.allSettled(
        files.map((file) =>
          fs.promises.writeFile(
            path.resolve(imageDir, path.basename(file.name)),
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

function populateMapIds(
  lookup: Record<string, MapInfo>
): Record<string, MapInfo> {
  return Object.entries(lookup ?? {}).reduce((updated, [id, info]) => {
    const trimmedId = trimExtension(id);
    return { ...updated, [trimmedId]: { ...info, id: trimmedId } };
  }, {});
}
