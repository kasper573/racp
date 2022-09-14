import * as fs from "fs";
import { FileStore } from "../../../lib/createFileStore";
import { parseLuaTableAs } from "../../common/parseLuaTableAs";
import { Linker } from "../../../lib/createPublicFileLinker";
import { ImageFormatter } from "../../../lib/createImageFormatter";
import { NpcDriver } from "../../rathena/NpcDriver";
import { typedAssign } from "../../../lib/typedAssign";
import { createImageUpdater } from "../../common/createImageUpdater";
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

  const mapLinker = linker.chain("maps");
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
    updateImages: createImageUpdater(formatter, mapLinker),
    get mapBounds() {
      return boundsFile.data ?? {};
    },
    async updateBounds(registryChanges: MapBoundsRegistry) {
      const updatedRegistry = {
        ...(boundsFile.data ?? {}),
        ...registryChanges,
      };
      boundsFile.update(JSON.stringify(updatedRegistry, null, 2));
    },
  };
}

const parseMapInfo = (luaCode: string) => parseLuaTableAs(luaCode, mapInfoType);

const trimExtension = (id: string) => id.replace(/\.[^.]+$/, "");
