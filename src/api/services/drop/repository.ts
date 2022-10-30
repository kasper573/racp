import { groupBy } from "lodash";
import { Repository } from "../../../lib/repo/Repository";
import { Item, ItemId } from "../item/types";
import { Monster, MonsterId } from "../monster/types";
import {
  applyDropRates,
  createDropsRatesRegistry,
} from "../../rathena/DropRatesRegistry";
import { ResourceFactory } from "../../resources";
import { ItemDrop } from "./types";

export type DropRepository = ReturnType<typeof createDropRepository>;

export function createDropRepository({
  resources,
  monsters,
  items,
}: {
  resources: ResourceFactory;
  monsters: Repository<Map<MonsterId, Monster>>;
  items: Repository<Map<ItemId, Item>>;
}) {
  const rates = createDropsRatesRegistry(
    resources.config({ configName: "battle/drops.conf" }),
    resources.config({ configName: "import/battle_conf.txt" })
  );
  const drops = monsters
    .and(items, rates)
    .map("drops", ([monsters, items, rates]) => {
      const itemsByAegisName = groupBy(
        Array.from(items.values()),
        (item) => item.AegisName
      );

      let dropIdCounter = 0;
      const drops: ItemDrop[] = [];
      for (const monster of monsters.values()) {
        for (const dropMetaData of [...monster.Drops, ...monster.MvpDrops]) {
          for (const item of itemsByAegisName[dropMetaData.Item] ?? []) {
            const drop = {
              ...item,
              ...dropMetaData,
              Id: dropIdCounter++,
              ItemId: item.Id,
              ItemName: item.Name,
              ImageUrl: item.ImageUrl,
              MonsterId: monster.Id,
              MonsterName: monster.Name,
              MonsterImageUrl: monster.ImageUrl,
            };
            if (rates) {
              applyDropRates(drop, monster, item, rates);
            }
            drops.push(drop);
          }
        }
      }
      return drops;
    });

  return {
    rates,
    drops,
  };
}
