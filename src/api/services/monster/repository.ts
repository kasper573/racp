import { pick } from "lodash";
import produce from "immer";
import { ResourceFactory } from "../../resources";
import { AdminSettingsRepository } from "../settings/repository";
import {
  Mvp,
  createMvpId,
  Monster,
  monsterSpawnType,
  MonsterSpawn,
  monsterType,
} from "./types";
import { postProcessMonster } from "./util/postProcessMonster";

export type MonsterRepository = ReturnType<typeof createMonsterRepository>;

export function createMonsterRepository({
  settings,
  resources,
}: {
  settings: AdminSettingsRepository;
  resources: ResourceFactory;
}) {
  const images = resources.images("monsters");
  const imageName = (id: Monster["Id"]) => `${id}${images.fileExtension}`;

  const spawnDB = resources.script("spawns", monsterSpawnType);
  const monsterDB = resources.yaml("db/mob_db.yml", {
    entityType: monsterType,
    getKey: (m) => m.Id,
  });

  const monsters = monsterDB
    .and(images, settings.all)
    .map("monsters", ([monsterDB, images, { rAthenaMode }]) =>
      produce(monsterDB, (db) => {
        for (const monster of db.values()) {
          postProcessMonster(monster, {
            rAthenaMode,
            imageUrl: images[imageName(monster.Id)],
          });
        }
      })
    );

  const spawns = spawnDB.and(images).map("spawns", ([spawnDB, images]) =>
    spawnDB.map(
      (spawn): MonsterSpawn => ({
        ...spawn,
        imageUrl: images[imageName(spawn.monsterId)],
      })
    )
  );

  const mvps = monsters.and(spawns).map("mvps", ([monsters, spawns]) => {
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
