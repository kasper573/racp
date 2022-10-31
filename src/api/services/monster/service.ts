import * as zod from "zod";
import { createSearchProcedure, noLimitForFilter } from "../../common/search";
import { t } from "../../trpc";
import { rpcFile } from "../../common/RpcFile";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { RAthenaDatabaseDriver } from "../../rathena/RAthenaDatabaseDriver";
import { typedAssign } from "../../../lib/std/typedAssign";
import { MvplogEntityType } from "../../rathena/DatabaseDriver.types";
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
  db: RAthenaDatabaseDriver;
  exposeBossStatuses?: boolean;
}) {
  return t.router({
    /**
     * Used from e2e test to prepare fixtures. Is locked behind admin access.
     */
    insertMvps: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(
        zod.array(
          MvplogEntityType.pick({
            map: true,
            monster_id: true,
            kill_char_id: true,
          })
        )
      )
      .mutation(async ({ input: logEntries }) => {
        await db.log
          .table("mvplog")
          .insert(logEntries.map((mvp) => ({ ...mvp, mvp_date: new Date() })));
      }),
    searchMvps: createSearchProcedure(
      mvpType,
      mvpFilter.type,
      async () => {
        let mvps = await repo.mvps;
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
      async () => Array.from((await repo.monsters).values()),
      (entity, payload) => monsterFilter.for(payload)(entity)
    ),
    searchSpawns: createSearchProcedure(
      monsterSpawnType,
      monsterSpawnFilter.type,
      () => repo.spawns,
      (entity, payload) => monsterSpawnFilter.for(payload)(entity),
      noLimitForFilter((filter) => filter?.map?.matcher === "equals")
    ),
    uploadImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(zod.array(rpcFile))
      .mutation(({ input }) => repo.images.update(input)),
    missingImages: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.array(monsterType.shape["Id"]))
      .query(async () => {
        const monstersWithMissingImages = await repo.missingImages();
        return monstersWithMissingImages.map((m) => m.Id);
      }),
  });
}
