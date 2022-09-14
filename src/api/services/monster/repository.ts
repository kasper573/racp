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

  const monsterResolver = createMonsterResolver(
    rAthenaMode,
    imageLinker,
    formatter.fileExtension
  );

  const monsters = yaml.resolve("db/mob_db.yml", monsterResolver);

  async function updateMonsters() {
    const registry = await monsters;
    for (const [, monster] of registry) {
      monsterResolver.postProcess?.(monster, registry);
    }
  }

  return {
    spawns: npc.resolve("scripts_monsters.conf", monsterSpawnType),
    map: monsters,
    updateImages: createImageUpdater(formatter, imageLinker, updateMonsters),
    missingImages: () =>
      monsters.then((map) =>
        Array.from(map.values()).filter(
          (monster) => monster.ImageUrl === undefined
        )
      ),
  };
}
