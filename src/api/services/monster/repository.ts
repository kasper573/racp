import { RAthenaMode } from "../../options";
import { YamlDriver } from "../../rathena/YamlDriver";
import { NpcDriver } from "../../rathena/NpcDriver";
import { createAsyncRepository } from "../../../lib/createAsyncRepository";
import { monsterSpawnType } from "./types";
import { createMonsterResolver } from "./util/createMonsterResolver";

export type MonsterRepository = ReturnType<typeof createMonsterRepository>;

export function createMonsterRepository({
  rAthenaMode,
  yaml,
  npc,
}: {
  rAthenaMode: RAthenaMode;
  yaml: YamlDriver;
  npc: NpcDriver;
}) {
  return createAsyncRepository(
    async () => {
      const [spawns, monsters] = await Promise.all([
        npc.resolve("scripts_monsters.conf", monsterSpawnType),
        yaml.resolve("db/mob_db.yml", createMonsterResolver(rAthenaMode)),
      ]);
      return { spawns, monsters };
    },
    (data) => ({
      spawns: data?.spawns ?? [],
      map: data?.monsters ?? new Map(),
    })
  );
}
