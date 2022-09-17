import { createRpcController } from "../../util/rpc";
import { createSearchController } from "../../common/search";
import { monsterFilter, monsterSpawnFilter } from "./types";
import { monsterDefinition } from "./definition";
import { MonsterRepository } from "./repository";

export async function monsterController(repo: MonsterRepository) {
  return createRpcController(monsterDefinition.entries, {
    searchMonsters: createSearchController(
      async () => Array.from((await repo.map).values()),
      (entity, payload) => monsterFilter.for(payload)(entity)
    ),
    searchMonsterSpawns: createSearchController(
      async () => repo.spawns,
      (entity, payload) => monsterSpawnFilter.for(payload)(entity)
    ),
    uploadMonsterImages: repo.updateImages,
    async getMonstersMissingImages() {
      const monstersWithMissingImages = await repo.missingImages();
      return monstersWithMissingImages.map((m) => m.Id);
    },
  });
}
