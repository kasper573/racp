import { createRpcController } from "../../util/rpc";
import { createSearchController } from "../../common/search";
import { monsterFilter, monsterSpawnFilter } from "./types";
import { monsterDefinition } from "./definition";
import { MonsterRepository } from "./repository";

export async function monsterController(repo: MonsterRepository) {
  return createRpcController(monsterDefinition.entries, {
    searchMonsters: createSearchController(
      async () => Array.from((await repo.getMonsters()).values()),
      (entity, payload) => monsterFilter.for(payload)(entity)
    ),
    searchMonsterSpawns: createSearchController(
      repo.getSpawns,
      (entity, payload) => monsterSpawnFilter.for(payload)(entity)
    ),
    uploadMonsterImages: repo.updateImages,
    async getMonstersMissingImages() {
      const monstersWithMissingImages = await repo.missingImages();
      return monstersWithMissingImages.map((m) => m.Id);
    },
  });
}
