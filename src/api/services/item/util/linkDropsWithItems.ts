import { groupBy } from "lodash";
import { ItemRepository } from "../repository";
import { MonsterRepository } from "../../monster/repository";
import { MonsterDropPostProcess } from "../../monster/types";
import { typedAssign } from "../../../../lib/std/typedAssign";

export async function linkDropsWithItems(
  items: ItemRepository,
  monsters: MonsterRepository
) {
  const [itemsMap, monsterMap] = await Promise.all([
    items.getItems(),
    monsters.getMonsters(),
  ]);
  const itemsByAegisName = groupBy(
    Array.from(itemsMap.values()),
    (item) => item.AegisName
  );

  for (const monster of monsterMap.values()) {
    for (const drop of [...monster.Drops, ...monster.MvpDrops]) {
      for (const item of itemsByAegisName[drop.Item] ?? []) {
        item.DroppedBy = item.DroppedBy ?? [];
        if (!item.DroppedBy.includes(monster.Id)) {
          item.DroppedBy.push(monster.Id);
        }
        const props: MonsterDropPostProcess = {
          ItemId: item.Id,
          Name: item.Name,
          Slots: item.Slots,
        };
        typedAssign(drop, props);
      }
    }
  }
}
