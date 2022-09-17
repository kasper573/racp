import * as fs from "fs";
import { debounce } from "lodash";
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

  const spawns = npc.resolve("scripts_monsters.conf", monsterSpawnType);
  const monsters = yaml.resolve("db/mob_db.yml", monsterResolver);

  const imageFileWatcher = fs.watch(
    imageLinker.directory,
    debounce(async () => {
      const registry = await monsters;
      for (const [, monster] of registry) {
        monsterResolver.postProcess?.(monster, registry);
      }
    }, 1000)
  );

  return {
    getSpawns: () => spawns,
    getMonsters: () => monsters,
    updateImages: createImageUpdater(formatter, imageLinker),
    missingImages: () =>
      monsters.then((map) =>
        Array.from(map.values()).filter(
          (monster) => monster.ImageUrl === undefined
        )
      ),
    destroy: () => imageFileWatcher.close(),
  };
}
