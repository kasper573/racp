import { pick } from "lodash";
import { RAthenaMode } from "../../options";
import { ResourceFactory } from "../../resources";
import {
  Mvp,
  createMvpId,
  Monster,
  monsterSpawnType,
  MonsterSpawn,
} from "./types";
import { createMonsterResolver } from "./util/createMonsterResolver";

export type MonsterRepository = ReturnType<typeof createMonsterRepository>;

export function createMonsterRepository({
  rAthenaMode,
  resources,
}: {
  rAthenaMode: RAthenaMode;
  resources: ResourceFactory;
}) {
  const images = resources.images("monsters");
  const imageName = (id: Monster["Id"]) => `${id}${images.fileExtension}`;

  const spawnDB = resources.script(monsterSpawnType);
  const monsterDB = resources.yaml(
    "db/mob_db.yml",
    createMonsterResolver(rAthenaMode)
  );

  const monsters = monsterDB.and(images).map(([monsterDB, images]) =>
    Array.from(monsterDB.values()).reduce(
      (monsters, monster) =>
        monsters.set(monster.Id, {
          ...monster,
          ImageUrl: images[imageName(monster.Id)],
        }),
      new Map<Monster["Id"], Monster>()
    )
  );

  const spawns = spawnDB.and(images).map(([spawnDB, images]) =>
    spawnDB.map(
      (spawn): MonsterSpawn => ({
        ...spawn,
        imageUrl: images[imageName(spawn.monsterId)],
      })
    )
  );

  const mvps = monsters.and(spawns).map(([monsters, spawns]) => {
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
  });

  return {
    spawns,
    monsters,
    mvps,
    images,
    missingImages: () =>
      monsters.then((map) =>
        Array.from(map.values()).filter(
          (monster) => monster.ImageUrl === undefined
        )
      ),
  };
}
