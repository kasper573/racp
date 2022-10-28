import { groupBy } from "lodash";
import { Repository } from "../../../lib/repo/Repository";
import { Item, ItemId } from "../item/types";
import { Monster, MonsterId } from "../monster/types";
import {
  applyDropRates,
  createDropsRates,
} from "../../rathena/createDropsRates";
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
  const dropRates = createDropsRates(
    resources.config({ configName: "battle/drops.conf" }),
    resources.config({ configName: "import/battle_conf.txt" })
  );
  return monsters
    .and(items, dropRates)
    .map("drops", ([monsters, items, dropRates]) => {
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
            if (dropRates) {
              applyDropRates(drop, monster, item, dropRates);
            }
            drops.push(drop);
          }
        }
      }
      return drops;
    });
}
