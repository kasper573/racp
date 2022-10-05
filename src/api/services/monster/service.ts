import * as zod from "zod";
import { createSearchProcedure, noLimitForFilter } from "../../common/search";
import { t } from "../../trpc";
import { rpcFile } from "../../common/RpcFile";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { DatabaseDriver } from "../../rathena/DatabaseDriver";
import {
  BossEntry,
  bossEntryFilter,
  bossEntryType,
  BossStatus,
  monsterFilter,
  monsterSpawnFilter,
  monsterSpawnType,
  monsterType,
} from "./types";
import { MonsterRepository } from "./repository";

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
    searchBosses: createSearchProcedure(
      bossEntryType,
      bossEntryFilter.type,
      async () => {
        const bosses = await repo.getBosses();
        if (exposeBossStatuses) {
          const statuses = await Promise.all(
            bosses.map((boss) => getBossStatus(db, boss))
          );
          for (let i = 0; i < bosses.length; i++) {
            bosses[i].status = statuses[i];
          }
        }
        return Object.values(bosses);
      },
      (entity, payload) => bossEntryFilter.for(payload)(entity)
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

async function getBossStatus(
  db: DatabaseDriver,
  boss: BossEntry
): Promise<BossStatus> {
  return { isAlive: true };
}
