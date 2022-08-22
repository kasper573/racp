import { createRpcController } from "../../../lib/rpc/createRpcController";
import { createSearchController } from "../../common/search";
import { monsterFilter, monsterSpawnFilter } from "./types";
import { monsterDefinition } from "./definition";
import { MonsterRepository } from "./repository";

export async function monsterController(monsters: MonsterRepository) {
  return createRpcController(monsterDefinition.entries, {
    searchMonsters: createSearchController(
      async () => Array.from((await monsters.map).values()),
      (entity, payload) => monsterFilter.for(payload)(entity)
    ),
    searchMonsterSpawns: createSearchController(
      async () => monsters.spawns,
      (entity, payload) => monsterSpawnFilter.for(payload)(entity)
    ),
  });
}
