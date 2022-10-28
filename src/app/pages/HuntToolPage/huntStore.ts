import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { uniq, without } from "lodash";
import { MonsterId } from "../../../api/services/monster/types";
import { Item, ItemId } from "../../../api/services/item/types";
import { typedAssign } from "../../../lib/std/typedAssign";

export const huntStore = createStore<{
  session: HuntSession;
  addItems: (items: ItemId[]) => void;
  updateItem: (hunt: HuntedItem) => void;
  removeItem: (itemId: ItemId) => void;
  normalizeSession: () => void;
  updateMonster: (hunt: HuntedMonster) => void;
}>()(
  persist(
    immer((set) => ({
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
          const existing = items.find((h) => h.itemId === update.itemId);
          if (existing) {
            typedAssign(existing, update);
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
          const existing = session.monsters.find(
            (m) => m.monsterId === update.monsterId
          );
          if (existing) {
            if (existing) {
              typedAssign(existing, update);
            }
          }
        });
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
  current: number;
  goal: number;
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
      current: 0,
      goal: 1,
    })),
    monsters: [],
  };
}

export function createHuntedItem(item: Item | ItemId): HuntedItem {
  return {
    itemId: typeof item === "number" ? item : item.Id,
    current: 0,
    goal: 1,
  };
}
