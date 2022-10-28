import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { groupBy, uniq, without } from "lodash";
import { MonsterId } from "../../../api/services/monster/types";
import { Item, ItemId } from "../../../api/services/item/types";
import { typedAssign } from "../../../lib/std/typedAssign";
import { ItemDrop } from "../../../api/services/drop/types";

export const huntStore = createStore<{
  session: HuntSession;
  addItems: (items: ItemId[]) => void;
  updateItem: (hunt: HuntedItem) => void;
  removeItem: (itemId: ItemId) => void;
  normalizeSession: () => void;
  updateMonster: (hunt: HuntedMonster) => void;
  estimateHuntDuration: (
    drops: Pick<ItemDrop, "ItemId" | "MonsterId" | "Rate">[]
  ) => number | "unknown";
}>()(
  persist(
    immer((set, getState) => ({
      session: createHuntSession(),
      addItems(added) {
        set(({ session }) => {
          const existing = session.items.map((i) => i.itemId);
          const newItems = without(added, ...existing);
          for (const id of newItems) {
            session.items.push(createHuntedItem(id));
          }
        });
      },
      updateItem(update) {
        set(({ session: { items } }) => {
          const item = items.find((h) => h.itemId === update.itemId);
          if (item) {
            typedAssign(item, update);
            item.amount = Math.max(item.amount, 0);
          }
        });
      },
      removeItem(itemId) {
        set(({ session: { items } }) => {
          const index = items.findIndex((h) => h.itemId === itemId);
          if (index !== -1) {
            items.splice(index, 1);
          }
        });
      },
      normalizeSession() {
        set(({ session }) => {
          const targetIds = uniq(
            session.items.map((i) => i.targets ?? []).flat()
          );
          const monsterIds = session.monsters.map((m) => m.monsterId);
          const added = without(targetIds, ...monsterIds);
          const removed = without(monsterIds, ...targetIds);
          for (const id of added) {
            session.monsters.push({ monsterId: id, kpm: 0 });
          }
          for (const id of removed) {
            const index = session.monsters.findIndex((m) => m.monsterId === id);
            session.monsters.splice(index, 1);
          }
        });
      },
      updateMonster(update) {
        set(({ session }) => {
          const monster = session.monsters.find(
            (m) => m.monsterId === update.monsterId
          );
          if (monster) {
            typedAssign(monster, update);
            monster.kpm = Math.max(monster.kpm, 0);
          }
        });
      },
      estimateHuntDuration(itemDrops) {
        const { session } = getState();

        const kpmLookup = session.monsters.reduce(
          (acc, m) => ({ ...acc, [m.monsterId]: m.kpm }),
          {} as Record<number, number>
        );

        const huntLookup = session.items.reduce(
          (acc, h) => ({ ...acc, [h.itemId]: h }),
          {} as Record<number, HuntedItem>
        );

        let huntMinutes: number | undefined;
        const groups = groupBy(itemDrops, (d) => d.ItemId);
        for (const drops of Object.values(groups)) {
          const itemId = drops[0].ItemId;
          const hunt = huntLookup[itemId];
          if (!hunt) {
            continue;
          }
          let successesPerMinute = 0;
          for (const drop of drops) {
            const attemptsPerMinute = kpmLookup[drop.MonsterId];
            if (attemptsPerMinute !== undefined) {
              successesPerMinute += attemptsPerMinute * (drop.Rate / 100 / 100);
            }
          }
          if (successesPerMinute > 0) {
            if (huntMinutes === undefined) {
              huntMinutes = 0;
            }
            huntMinutes += hunt.amount / successesPerMinute;
          }
        }

        if (huntMinutes === undefined) {
          return "unknown";
        } else {
          return huntMinutes * 60 * 1000;
        }
      },
    })),
    { name: "hunts" }
  )
);

export type HuntSession = {
  items: HuntedItem[];
  monsters: HuntedMonster[];
};

export type HuntedItem = {
  itemId: ItemId;
  amount: number;
  targets?: MonsterId[];
};

export type HuntedMonster = {
  monsterId: MonsterId;
  kpm: number;
};

export function createHuntSession(): HuntSession {
  return {
    items: [512, 938].map((id) => ({
      itemId: id,
      targets: [1002],
      amount: 1,
    })),
    monsters: [],
  };
}

export function createHuntedItem(item: Item | ItemId): HuntedItem {
  return {
    itemId: typeof item === "number" ? item : item.Id,
    amount: 1,
  };
}
