import { RAthenaMode } from "../../options";
import { YamlDriver } from "../../rathena/YamlDriver";
import { NpcDriver } from "../../rathena/NpcDriver";
import { ImageFormatter } from "../../../lib/image/createImageFormatter";
import { Linker } from "../../../lib/fs/createPublicFileLinker";
import { createImageRepository } from "../../common/createImageRepository";
import { Logger } from "../../../lib/logger";
import { createAsyncMemo } from "../../../lib/createAsyncMemo";
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

  const getMonsters = createAsyncMemo(
    async () => [await monstersPromise, imageRepository.urlMap] as const,
    (monsters, urlMap) => {
      logger.log("Recomputing monster repository");
      return Array.from(monsters.values()).reduce(
        (monsters, monster) =>
          monsters.set(monster.Id, {
            ...monster,
            ImageUrl: urlMap[imageName(monster.Id)],
          }),
        new Map<Monster["Id"], Monster>()
      );
    }
  );

  const getMonsterSpawns = createAsyncMemo(
    async () => [await spawnsPromise, imageRepository.urlMap] as const,
    (spawns, urlMap) => {
      logger.log("Recomputing monster spawn repository");
      return spawns.map((spawn) => ({
        ...spawn,
        imageUrl: urlMap[imageName(spawn.id)],
      }));
    }
  );

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
