import { RAthenaMode } from "../../options";
import { YamlDriver } from "../../rathena/YamlDriver";
import { NpcDriver } from "../../rathena/NpcDriver";
import { ImageFormatter } from "../../../lib/image/createImageFormatter";
import { Linker } from "../../../lib/fs/createPublicFileLinker";
import { createImageRepository } from "../../common/createImageRepository";
import { Logger } from "../../../lib/logger";
import { Monster, monsterSpawnType } from "./types";
import { createMonsterResolver } from "./util/createMonsterResolver";

export type MonsterRepository = ReturnType<typeof createMonsterRepository>;

export function createMonsterRepository({
  rAthenaMode,
  linker,
  formatter,
  yaml,
  npc,
  logger: parentLogger,
}: {
  linker: Linker;
  formatter: ImageFormatter;
  rAthenaMode: RAthenaMode;
  yaml: YamlDriver;
  npc: NpcDriver;
  logger: Logger;
}) {
  const logger = parentLogger.chain("monster");
  const imageLinker = linker.chain("monsters");
  const imageName = (id: Monster["Id"]) => `${id}${formatter.fileExtension}`;
  const imageRepository = createImageRepository(formatter, imageLinker, logger);

  const monsterResolver = createMonsterResolver(rAthenaMode);
  const spawnsPromise = npc.resolve("scripts_monsters.conf", monsterSpawnType);
  const monstersPromise = yaml.resolve("db/mob_db.yml", monsterResolver);

  async function getMonsters() {
    const monsters = await monstersPromise;
    return Array.from(monsters.values()).reduce(
      (monsters, monster) =>
        monsters.set(monster.Id, {
          ...monster,
          ImageUrl: imageRepository.urlMap.get(imageName(monster.Id)),
        }),
      new Map<Monster["Id"], Monster>()
    );
  }

  async function getMonsterSpawns() {
    const spawns = await spawnsPromise;
    return spawns.map((spawn) => ({
      ...spawn,
      imageUrl: imageRepository.urlMap.get(imageName(spawn.id)),
    }));
  }

  return {
    getSpawns: getMonsterSpawns,
    getMonsters,
    updateImages: imageRepository.update,
    missingImages: () =>
      getMonsters().then((map) =>
        Array.from(map.values()).filter(
          (monster) => monster.ImageUrl === undefined
        )
      ),
    destroy: () => imageRepository.close(),
  };
}
