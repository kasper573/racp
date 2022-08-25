import { groupBy } from "lodash";
import { RAthenaMode } from "../../options";
import { YamlDriver } from "../../rathena/YamlDriver";
import { NpcDriver } from "../../rathena/NpcDriver";
import { ItemRepository } from "../item/repository";
import { monsterSpawnType } from "./types";
import { createMonsterResolver } from "./util/createMonsterResolver";

export type MonsterRepository = ReturnType<typeof createMonsterRepository>;

export function createMonsterRepository({
  rAthenaMode,
  yaml,
  npc,
  items,
}: {
  items: ItemRepository;
  rAthenaMode: RAthenaMode;
  yaml: YamlDriver;
  npc: NpcDriver;
}) {
  return {
    spawns: npc.resolve("scripts_monsters.conf", monsterSpawnType),
    map: items.ready.then(() =>
      yaml.resolve(
        "db/mob_db.yml",
        createMonsterResolver(
          rAthenaMode,
          groupBy(Array.from(items.map.values()), (item) => item.AegisName)
        )
      )
    ),
  };
}
