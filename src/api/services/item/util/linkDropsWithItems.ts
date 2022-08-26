import { groupBy } from "lodash";
import { ItemRepository } from "../repository";
import { MonsterRepository } from "../../monster/repository";
import { MonsterDropPostProcess } from "../../monster/types";
import { typedAssign } from "../../../../lib/typedAssign";

export async function linkDropsWithItems(
  items: ItemRepository,
  monsters: MonsterRepository
) {
  const [, monsterMap] = await Promise.all([items.ready, monsters.map]);
  const itemsByAegisName = groupBy(
    Array.from(items.map.values()),
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
