import { groupBy } from "lodash";
import { createAsyncMemo } from "../../../lib/createMemo";
import { ItemId } from "../item/types";
import { MonsterRepository } from "../monster/repository";
import { ItemRepository } from "../item/repository";
import { Logger } from "../../../lib/logger";
import { ItemDrop } from "./types";

export type DropRepository = ReturnType<typeof createDropRepository>;

export function createDropRepository({
  monsters,
  items,
  logger,
}: {
  monsters: MonsterRepository;
  items: ItemRepository;
  logger: Logger;
}) {
  const getDrops = createAsyncMemo(
    () => Promise.all([monsters.getMonsters(), items.getItems()]),
    (monsters, items) => {
      logger.log("Recomputing drop repository");
      const itemsByAegisName = groupBy(
        Array.from(items.values()),
        (item) => item.AegisName
      );

      let dropIdCounter = 0;
      const drops = new Map<ItemId, ItemDrop>();
      for (const monster of monsters.values()) {
        for (const dropMetaData of [...monster.Drops, ...monster.MvpDrops]) {
          for (const item of itemsByAegisName[dropMetaData.Item] ?? []) {
            let drop = drops.get(item.Id);
            if (!drop) {
              drop = {
                ...item,
                ...dropMetaData,
                Id: dropIdCounter++,
                ItemId: item.Id,
                DroppedBy: [],
              };
              drops.set(item.Id, drop);
            }
            if (!drop.DroppedBy.includes(monster.Id)) {
              drop.DroppedBy.push(monster.Id);
            }
          }
        }
      }
      return Array.from(drops.values());
    }
  );

  return { getDrops };
}
