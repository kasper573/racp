import * as zod from "zod";
import { createSearchProcedure } from "../../common/search";
import { t } from "../t";
import { rpcFile } from "../../common/RpcFile";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import {
  monsterFilter,
  monsterSpawnFilter,
  monsterSpawnType,
  monsterType,
} from "./types";
import { MonsterRepository } from "./repository";

export type MonsterService = ReturnType<typeof createMonsterService>;

export function createMonsterService(repo: MonsterRepository) {
  return t.router({
    searchMonsters: createSearchProcedure(
      monsterType,
      monsterFilter.type,
      async () => Array.from((await repo.getMonsters()).values()),
      (entity, payload) => monsterFilter.for(payload)(entity)
    ),
    searchMonsterSpawns: createSearchProcedure(
      monsterSpawnType,
      monsterSpawnFilter.type,
      repo.getSpawns,
      (entity, payload) => monsterSpawnFilter.for(payload)(entity)
    ),
    uploadMonsterImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(zod.array(rpcFile))
      .mutation(({ input }) => repo.updateImages(input)),
    getMonstersMissingImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.array(monsterType.shape["Id"]))
      .query(async () => {
        const monstersWithMissingImages = await repo.missingImages();
        return monstersWithMissingImages.map((m) => m.Id);
      }),
  });
}
