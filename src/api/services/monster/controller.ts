import { createRpcController } from "../../../lib/rpc/createRpcController";
import { createSearchController } from "../search/controller";
import { monsterFilter, monsterSpawnFilter } from "./types";
import { monsterDefinition } from "./definition";
import { MonsterRepository } from "./repository";

export async function monsterController(monsters: MonsterRepository) {
  return createRpcController(monsterDefinition.entries, {
    searchMonsters: createSearchController(
      async () => {
        await monsters.ready;
        return Promise.resolve(Array.from(monsters.map.values()));
      },
      (entity, payload) => monsterFilter.for(payload)(entity)
    ),
    searchMonsterSpawns: createSearchController(
      async () => {
        await monsters.ready;
        return Promise.resolve(monsters.spawns);
      },
      (entity, payload) => monsterSpawnFilter.for(payload)(entity)
    ),
  });
}
