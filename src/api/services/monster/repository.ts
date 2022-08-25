import { RAthenaMode } from "../../options";
import { YamlDriver } from "../../rathena/YamlDriver";
import { NpcDriver } from "../../rathena/NpcDriver";
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
  return {
    spawns: npc.resolve("scripts_monsters.conf", monsterSpawnType),
    map: yaml.resolve("db/mob_db.yml", createMonsterResolver(rAthenaMode)),
  };
}
