import { createRpcController } from "../../../lib/rpc/createRpcController";
import { createSearchController } from "../search/controller";
import { monsterFilter } from "./types";
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
    async getMonsterSpawns(monsterId) {
      return monsters.spawnLookup[monsterId] ?? [];
    },
  });
}
