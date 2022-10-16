import { pick } from "lodash";
import { RAthenaMode } from "../../options";
import { YamlDriver } from "../../rathena/YamlDriver";
import { ScriptDriver } from "../../rathena/ScriptDriver";
import { ImageFormatter } from "../../../lib/image/createImageFormatter";
import { Linker } from "../../../lib/fs/createPublicFileLinker";
import { ImageUrlMap } from "../../common/ImageUrlMap";
import { Logger } from "../../../lib/logger";
import { createAsyncMemo } from "../../../lib/createMemo";
import { Mvp, createMvpId, Monster, monsterSpawnType } from "./types";
import { createMonsterResolver } from "./util/createMonsterResolver";

export type MonsterRepository = ReturnType<typeof createMonsterRepository>;

export function createMonsterRepository({
  rAthenaMode,
  linker,
  formatter,
  yaml,
  script,
  logger: parentLogger,
}: {
  linker: Linker;
  formatter: ImageFormatter;
  rAthenaMode: RAthenaMode;
  yaml: YamlDriver;
  script: ScriptDriver;
  logger: Logger;
}) {
  const logger = parentLogger.chain("monster");
  const imageLinker = linker.chain("monsters");
  const imageName = (id: Monster["Id"]) => `${id}${formatter.fileExtension}`;
  const imageUrlMap = new ImageUrlMap({
    formatter,
    linker: imageLinker,
    logger,
  });

  const monsterResolver = createMonsterResolver(rAthenaMode);
  const monsters = yaml.resolve("db/mob_db.yml", monsterResolver);
  const spawnsPromise = logger.track(
    script.resolve(monsterSpawnType),
    "script.resolve",
    "monsterSpawn"
  );

  const getMonsters = createAsyncMemo(
    async () => Promise.all([monsters.read(), imageUrlMap.read()]),
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
    async () => Promise.all([spawnsPromise, imageUrlMap.read()]),
    (spawns, urlMap) => {
      logger.log("Recomputing monster spawn repository");
      return spawns.map((spawn) => ({
        ...spawn,
        imageUrl: urlMap[imageName(spawn.monsterId)],
      }));
    }
  );

  const getMvps = createAsyncMemo(
    () => Promise.all([getMonsters(), getMonsterSpawns()]),
    (monsters, spawns) => {
      const entries: Record<string, Mvp> = {};
      for (const spawn of spawns) {
        const monster = monsters.get(spawn.monsterId);
        if (!monster?.Modes["Mvp"]) {
          continue;
        }
        const bossId = createMvpId(monster, spawn);
        if (!entries[bossId]) {
          entries[bossId] = {
            id: bossId,
            monsterId: monster.Id,
            name: monster.Name,
            imageUrl: monster.ImageUrl,
            mapId: spawn.map,
            mapName: spawn.map,
            ...pick(spawn, "spawnDelay", "spawnWindow"),
          };
        }
      }

      return Object.values(entries);
    }
  );

  return {
    getSpawns: getMonsterSpawns,
    getMonsters,
    getMvps,
    updateImages: imageUrlMap.update,
    missingImages: () =>
      getMonsters().then((map) =>
        Array.from(map.values()).filter(
          (monster) => monster.ImageUrl === undefined
        )
      ),
    destroy: () => imageUrlMap.dispose(),
  };
}
