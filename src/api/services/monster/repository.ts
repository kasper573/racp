import * as fs from "fs";
import { RAthenaMode } from "../../options";
import { YamlDriver } from "../../rathena/YamlDriver";
import { NpcDriver } from "../../rathena/NpcDriver";
import { ImageFormatter } from "../../../lib/createImageFormatter";
import { Linker } from "../../../lib/createPublicFileLinker";
import { createImageUpdater } from "../../common/createImageUpdater";
import { defined } from "../../../lib/defined";
import { monsterSpawnType } from "./types";
import { createMonsterResolver } from "./util/createMonsterResolver";

export type MonsterRepository = ReturnType<typeof createMonsterRepository>;

export function createMonsterRepository({
  rAthenaMode,
  linker,
  formatter,
  yaml,
  npc,
}: {
  linker: Linker;
  formatter: ImageFormatter;
  rAthenaMode: RAthenaMode;
  yaml: YamlDriver;
  npc: NpcDriver;
}) {
  const imageLinker = linker.chain("monsterImages");
  const monsters = yaml.resolve(
    "db/mob_db.yml",
    createMonsterResolver(rAthenaMode, imageLinker, formatter.fileExtension)
  );
  return {
    spawns: npc.resolve("scripts_monsters.conf", monsterSpawnType),
    map: monsters,
    updateImages: createImageUpdater(formatter, imageLinker),
    missingImages: async () => {
      const map = await monsters;
      const missing = await Promise.all(
        Array.from(map.values()).map(async (monster) => {
          if (
            monster.ImageUrl &&
            !(await exists(imageLinker.urlToPath(monster.ImageUrl)))
          ) {
            return monster;
          }
        })
      );
      return defined(missing);
    },
  };
}

const exists = async (path: string) => {
  try {
    await fs.promises.stat(path);
    return true;
  } catch {
    return false;
  }
};
