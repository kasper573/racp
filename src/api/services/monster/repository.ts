import { groupBy } from "lodash";
import { RAthenaMode } from "../../options";
import { YamlDriver } from "../../rathena/YamlDriver";
import { NpcDriver } from "../../rathena/NpcDriver";
import { ItemRepository } from "../item/repository";
import { Item } from "../item/types";
import { typedAssign } from "../../../lib/typedAssign";
import { Monster, MonsterDropPostProcess, monsterSpawnType } from "./types";
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
    // Monsters have embedded item drop data that is cumbersome to work with in the client.
    // So we wait for the item repository to be ready and populate the drops with useful info.
    map: Promise.all([
      yaml.resolve("db/mob_db.yml", createMonsterResolver(rAthenaMode)),
      items.ready,
    ]).then(([monsters]) => {
      monsterPostProcess(
        Array.from(monsters.values()),
        Array.from(items.map.values())
      );
      return monsters;
    }),
  };
}

function monsterPostProcess(monsters: Monster[], items: Item[]) {
  const itemsByAegisName = groupBy(items, (item) => item.AegisName);
  for (const monster of monsters.values()) {
    for (const drop of monster.Drops) {
      const item = itemsByAegisName[drop.Item]?.[0];
      if (item) {
        const props: MonsterDropPostProcess = {
          ItemId: item.Id,
          Name: item.Name,
        };
        typedAssign(drop, props);
      }
    }
  }
}
