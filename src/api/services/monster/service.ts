import * as zod from "zod";
import { createSearchProcedure, noLimitForFilter } from "../../common/search";
import { t } from "../../trpc";
import { rpcFile } from "../../common/RpcFile";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { DatabaseDriver } from "../../rathena/DatabaseDriver";
import { typedAssign } from "../../../lib/std/typedAssign";
import {
  monsterFilter,
  monsterSpawnFilter,
  monsterSpawnType,
  monsterType,
  mvpFilter,
  mvpType,
} from "./types";
import { MonsterRepository } from "./repository";
import { queryMvpStatus } from "./util/queryMvpStatus";

export type MonsterService = ReturnType<typeof createMonsterService>;

export function createMonsterService({
  repo,
  db,
  exposeBossStatuses = true,
}: {
  repo: MonsterRepository;
  db: DatabaseDriver;
  exposeBossStatuses?: boolean;
}) {
  return t.router({
    searchMvps: createSearchProcedure(
      mvpType,
      mvpFilter.type,
      async () => {
        let mvps = await repo.getMvps();
        if (exposeBossStatuses) {
          const statuses = await Promise.all(
            mvps.map((boss) => queryMvpStatus(db, boss))
          );
          mvps = mvps.map((mvp, i) => typedAssign({ ...mvp }, statuses[i]));
        }
        return mvps;
      },
      (entity, payload) => mvpFilter.for(payload)(entity)
    ),
    search: createSearchProcedure(
      monsterType,
      monsterFilter.type,
      async () => Array.from((await repo.getMonsters()).values()),
      (entity, payload) => monsterFilter.for(payload)(entity)
    ),
    searchSpawns: createSearchProcedure(
      monsterSpawnType,
      monsterSpawnFilter.type,
      repo.getSpawns,
      (entity, payload) => monsterSpawnFilter.for(payload)(entity),
      noLimitForFilter((filter) => filter?.map?.matcher === "equals")
    ),
    uploadImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(zod.array(rpcFile))
      .mutation(({ input }) => repo.updateImages(input)),
    missingImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.array(monsterType.shape["Id"]))
      .query(async () => {
        const monstersWithMissingImages = await repo.missingImages();
        return monstersWithMissingImages.map((m) => m.Id);
      }),
  });
}
