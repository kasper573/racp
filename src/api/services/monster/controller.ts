import { groupBy } from "lodash";
import { createRpcController } from "../../../lib/rpc/createRpcController";
import { createSearchController } from "../search/controller";
import { NpcDriver } from "../../rathena/NpcDriver";
import { YamlDriver } from "../../rathena/YamlDriver";
import { RAthenaMode } from "../../options";
import { monsterSpawnType } from "./types";
import { monsterDefinition, monsterFilter } from "./definition";
import { createMonsterResolver } from "./util/createMonsterResolver";

export async function monsterController({
  rAthenaMode,
  yaml,
  npc,
}: {
  rAthenaMode: RAthenaMode;
  yaml: YamlDriver;
  npc: NpcDriver;
}) {
  const [spawns, monsters] = await Promise.all([
    npc.resolve("scripts_monsters.conf", monsterSpawnType),
    yaml.resolve("db/mob_db.yml", createMonsterResolver(rAthenaMode)),
  ]);

  const spawnLookup = groupBy(spawns, "id");

  return createRpcController(monsterDefinition.entries, {
    searchMonsters: createSearchController(
      Array.from(monsters.values()),
      (entity, payload) => monsterFilter.for(payload)(entity)
    ),
    async getMonsterSpawns(monsterId) {
      return spawnLookup[monsterId] ?? [];
    },
  });
}
