import { groupBy } from "lodash";
import { createRpcController } from "../../../lib/rpc/createRpcController";
import { createSearchController } from "../search/controller";
import { NpcDriver } from "../../rathena/NpcDriver";
import { YamlDriver } from "../../rathena/YamlDriver";
import { monsterSpawnType, monsterType } from "./types";
import { monsterDefinition } from "./definition";

export function monsterController({
  yaml,
  npc,
}: {
  yaml: YamlDriver;
  npc: NpcDriver;
}) {
  const monsters = yaml.resolve("db/mob_db.yml", {
    entityType: monsterType,
    getKey: (m) => m.Id,
  });

  const monsterSpawnList = npc.resolve(
    "scripts_monsters.conf",
    monsterSpawnType
  );
  const monsterSpawnLookup = groupBy(monsterSpawnList, "id");

  return createRpcController(monsterDefinition.entries, {
    searchMonsters: createSearchController(
      Array.from(monsters.values()),
      () => true
    ),
    async getMonsterSpawns(monsterId) {
      return monsterSpawnLookup[monsterId] ?? [];
    },
  });
}
