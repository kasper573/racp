import { createRpcController } from "../../../lib/rpc/createRpcController";
import { createSearchController } from "../search/controller";
import { NpcDriver } from "../../rathena/NpcDriver";
import { createYamlResolver, YamlDriver } from "../../rathena/YamlDriver";
import { monsterSpawnType, monsterType } from "./types";
import { monsterDefinition } from "./definition";

export function monsterController({
  yaml,
  npc,
}: {
  yaml: YamlDriver;
  npc: NpcDriver;
}) {
  const monsters = yaml.resolve("db/mob_db.yml", monsterResolver);
  const monsterSpawns = npc.resolve("scripts_monsters.conf", monsterSpawnType);
  return createRpcController(monsterDefinition.entries, {
    searchMonsterSpawns: createSearchController(monsterSpawns, () => true),
  });
}

const monsterResolver = createYamlResolver(monsterType, {
  getKey: (monster) => monster.Id,
});
