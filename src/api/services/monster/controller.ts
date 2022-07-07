import { createRpcController } from "../../../lib/rpc/createRpcController";
import { createSearchController } from "../search/controller";
import { NpcDriver } from "../../rathena/NpcDriver";
import { monsterSpawnType } from "./types";
import { monsterDefinition } from "./definition";

export function monsterController({ npc }: { npc: NpcDriver }) {
  const monsterSpawns = npc.resolve("scripts_monsters.conf", monsterSpawnType);
  return createRpcController(monsterDefinition.entries, {
    searchMonsterSpawns: createSearchController(monsterSpawns, () => true),
  });
}
