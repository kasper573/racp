import * as path from "path";
import * as fs from "fs";
import { FileStore } from "../../../lib/createFileStore";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { Linker } from "../../../lib/createPublicFileLinker";
import { ImageFormatter } from "../../../lib/createImageFormatter";
import { NpcDriver } from "../../rathena/NpcDriver";
import { typedAssign } from "../../../lib/typedAssign";
import {
  MapBoundsRegistry,
  mapBoundsRegistryType,
  MapId,
  MapInfo,
  mapInfoType,
  warpType,
} from "./types";
export type MapRepository = ReturnType<typeof createMapRepository>;

export function createMapRepository({
  files,
  linker,
  formatter,
  npc,
}: {
  files: FileStore;
  linker: Linker;
  formatter: ImageFormatter;
  npc: NpcDriver;
}) {
  const info: Record<string, MapInfo> = {};

  const mapLinker = linker.chain("mapImages");
  const mapImageName = (mapId: string) => `${mapId}${formatter.fileExtension}`;
  const mapImageUrl = (mapId: string) => mapLinker.url(mapImageName(mapId));
  const mapImagePath = (mapId: string) => mapLinker.path(mapImageName(mapId));

  const infoFile = files.entry("mapInfo.lub", parseMapInfo, (newInfo = {}) => {
    for (const [key, entry] of Object.entries(newInfo)) {
      const id = trimExtension(key);
      info[id] = { ...info[id], ...entry, id, imageUrl: mapImageUrl(id) };
    }
  });

  const boundsFile = files.entry(
    "mapBounds.json",
    (str) => mapBoundsRegistryType.safeParse(JSON.parse(str)),
    (newBoundsRegistry) => {
      for (const [mapId, bounds] of Object.entries(newBoundsRegistry ?? {})) {
        const entry = info[mapId];
        if (entry) {
          typedAssign(entry, { bounds });
        }
      }
    }
  );

  return {
    info,
    updateInfo: infoFile.update,
    countImages: () => fs.readdirSync(mapLinker.directory).length,
    warps: npc.resolve("scripts_warps.conf", warpType),
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
    get mapBounds() {
      return boundsFile.data ?? {};
    },
    async updateBounds(bounds: MapBoundsRegistry) {
      boundsFile.update(JSON.stringify(bounds));
    },
  };
}

const parseMapInfo = (luaCode: string) => parseLuaTableAs(luaCode, mapInfoType);

const trimExtension = (id: string) => id.replace(/\.[^.]+$/, "");
