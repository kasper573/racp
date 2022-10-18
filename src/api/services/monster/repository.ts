import { pick } from "lodash";
import { RAthenaMode } from "../../options";
import { createAsyncMemo } from "../../../lib/createMemo";
import { ResourceFactory } from "../../resources";
import { Mvp, createMvpId, Monster, monsterSpawnType } from "./types";
import { createMonsterResolver } from "./util/createMonsterResolver";

export type MonsterRepository = ReturnType<typeof createMonsterRepository>;

export function createMonsterRepository({
  rAthenaMode,
  resources,
}: {
  rAthenaMode: RAthenaMode;
  resources: ResourceFactory;
}) {
  const imageUrlMap = resources.images("monsters");
  const imageName = (id: Monster["Id"]) => `${id}${imageUrlMap.fileExtension}`;

  const spawns = resources.script(monsterSpawnType);
  const monsters = resources.yaml(
    "db/mob_db.yml",
    createMonsterResolver(rAthenaMode)
  );

  const getMonsters = createAsyncMemo(
    async () => Promise.all([monsters, imageUrlMap]),
    (monsters, urlMap) => {
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
    async () => Promise.all([spawns, imageUrlMap]),
    (spawns, urlMap) => {
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
