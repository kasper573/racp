import { v4 as uuid } from "uuid";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { groupBy, uniq, without } from "lodash";
import { MonsterId, MonsterSpawnId } from "../../../api/services/monster/types";
import { Item, ItemId } from "../../../api/services/item/types";
import { typedAssign } from "../../../lib/std/typedAssign";
import { ItemDrop } from "../../../api/services/drop/types";

export const huntStore = createStore<HuntStore>()(
  persist(
    immer((set, getState) => ({
      kpxUnit: "Kills per minute",
      setKpxUnit(value) {
        set((state) => {
          state.kpxUnit = value;
        });
      },
      dropChanceMultiplier: 1,
      setDropChanceMultiplier(value) {
        set((state) => {
          state.dropChanceMultiplier = Math.max(value, 0);
        });
      },
      hunts: [],
      createHunt() {
        set((state) => {
          state.hunts.push(createHunt());
        });
      },
      deleteHunt(id) {
        set((state) => {
          const index = state.hunts.findIndex((hunt) => hunt.id === id);
          if (index !== -1) {
            state.hunts.splice(index, 1);
          }
        });
      },
      session: createHunt(),
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
            session.monsters.push({ monsterId: id, killsPerUnit: 0 });
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
            monster.killsPerUnit = Math.max(monster.killsPerUnit, 0);
          }
        });
      },
      estimateHuntDuration(itemDrops) {
        const { session, kpxUnit, dropChanceMultiplier } = getState();

        const killsPerUnitLookup = session.monsters.reduce(
          (acc, m) => ({ ...acc, [m.monsterId]: m.killsPerUnit }),
          {} as Record<number, number>
        );

        const huntLookup = session.items.reduce(
          (acc, h) => ({ ...acc, [h.itemId]: h }),
          {} as Record<number, HuntedItem>
        );

        let huntUnits: number | undefined;
        const groups = groupBy(itemDrops, (d) => d.ItemId);
        for (const drops of Object.values(groups)) {
          const itemId = drops[0].ItemId;
          const hunt = huntLookup[itemId];
          if (!hunt) {
            continue;
          }
          let successesPerUnit = 0;
          for (const drop of drops) {
            const attemptsPerUnit = killsPerUnitLookup[drop.MonsterId];
            if (attemptsPerUnit !== undefined) {
              const dropChance = (drop.Rate / 100 / 100) * dropChanceMultiplier;
              successesPerUnit += attemptsPerUnit * dropChance;
            }
          }
          if (successesPerUnit > 0) {
            if (huntUnits === undefined) {
              huntUnits = 0;
            }
            huntUnits += hunt.amount / successesPerUnit;
          }
        }

        if (huntUnits === undefined) {
          return "unknown";
        } else {
          const scale = kpxUnitScales[kpxUnit];
          return huntUnits * scale;
        }
      },
    })),
    { name: "hunts" }
  )
);

export interface HuntStore {
  hunts: Hunt[];
  session: Hunt;
  addItems: (items: ItemId[]) => void;
  updateItem: (hunt: HuntedItem) => void;
  removeItem: (itemId: ItemId) => void;
  normalizeSession: () => void;
  updateMonster: (hunt: HuntedMonster) => void;
  estimateHuntDuration: (
    drops: Pick<ItemDrop, "ItemId" | "MonsterId" | "Rate">[]
  ) => number | "unknown";
  dropChanceMultiplier: number;
  setDropChanceMultiplier: (value: number) => void;
  kpxUnit: KpxUnit;
  setKpxUnit: (value: KpxUnit) => void;
  createHunt: () => void;
  deleteHunt: (id: HuntId) => void;
}

export type HuntId = string;
export type Hunt = {
  id: HuntId;
  name: string;
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
  spawnId?: MonsterSpawnId;
  killsPerUnit: number;
};

export type KpxUnit = typeof kpxUnits[number];

export const kpxUnits = [
  "Kills per minute",
  "Kills per hour",
  "Kills per day",
] as const;

export const kpxUnitScales: Record<KpxUnit, number> = {
  "Kills per minute": 1000 * 60,
  "Kills per hour": 1000 * 60 * 60,
  "Kills per day": 1000 * 60 * 60 * 24,
};

export function createHunt(): Hunt {
  return {
    id: uuid(),
    name: "New hunt",
    items: [],
    monsters: [],
  };
}

export function createHuntedItem(item: Item | ItemId): HuntedItem {
  return {
    itemId: typeof item === "number" ? item : item.Id,
    amount: 1,
  };
}
