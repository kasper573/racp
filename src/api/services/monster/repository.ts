import { RAthenaMode } from "../../options";
import { YamlDriver } from "../../rathena/YamlDriver";
import { NpcDriver } from "../../rathena/NpcDriver";
import { ImageFormatter } from "../../../lib/createImageFormatter";
import { Linker } from "../../../lib/createPublicFileLinker";
import { createImageUpdater } from "../../common/createImageUpdater";
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
  const imageLinker = linker.chain("monsters");
  let monsters = resolveMonsters();

  function resolveMonsters() {
    return yaml.resolve(
      "db/mob_db.yml",
      createMonsterResolver(rAthenaMode, imageLinker, formatter.fileExtension)
    );
  }

  function updateMonsters() {
    monsters = resolveMonsters();
  }

  return {
    spawns: npc.resolve("scripts_monsters.conf", monsterSpawnType),
    get map() {
      return monsters;
    },
    updateImages: createImageUpdater(formatter, imageLinker, updateMonsters),
    missingImages: () =>
      monsters.then((map) =>
        Array.from(map.values()).filter(
          (monster) => monster.ImageUrl === undefined
        )
      ),
  };
}
