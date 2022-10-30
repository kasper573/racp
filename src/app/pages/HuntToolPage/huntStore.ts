import { v4 as uuid } from "uuid";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { groupBy, uniq, without } from "lodash";
import * as zod from "zod";
import { MonsterId, MonsterSpawnId } from "../../../api/services/monster/types";
import { ItemId } from "../../../api/services/item/types";
import { typedAssign } from "../../../lib/std/typedAssign";
import { ItemDrop } from "../../../api/services/drop/types";

export const huntStore = createStore<HuntStore>()(
  persist(
    immer((set, getState) => ({
      kpxUnit: "Kills per minute",
      dropChanceMultiplier: 1,
      hunts: [],
      items: [],
      monsters: [],

      getRichHunt(huntId) {
        const state = getState();
        const hunt = state.hunts.find((h) => h.id === huntId);
        if (!hunt) {
          return;
        }
        return {
          ...hunt,
          monsters: state.monsters.filter((m) => m.huntId === huntId),
          items: state.items.filter((m) => m.huntId === huntId),
        };
      },

      setKpxUnit(value) {
        set((state) => {
          state.kpxUnit = value;
        });
      },
      setDropChanceMultiplier(value) {
        set((state) => {
          state.dropChanceMultiplier = Math.max(value, 0);
        });
      },
      createHunt() {
        set((state) => {
          state.hunts.push({
            id: uuid(),
            name: "New hunt",
          });
        });
      },
      renameHunt(huntId, newName) {
        set((state) => {
          const hunt = state.hunts.find((h) => h.id === huntId);
          if (hunt) {
            hunt.name = newName;
          }
        });
      },
      deleteHunt(id) {
        set((state) => {
          state.hunts = state.hunts.filter((h) => h.id !== id);
          state.items = state.items.filter((i) => i.huntId !== id);
          state.monsters = state.monsters.filter((m) => m.huntId !== id);
        });
      },
      addItems(huntId, addedItemIds) {
        set((state) => {
          const newItemIds = addedItemIds.filter(
            (itemId) => !state.items.some((item) => item.itemId === itemId)
          );
          for (const id of newItemIds) {
            state.items.push({ itemId: id, huntId, amount: 0 });
          }
          normalizeHunt(huntId, state);
        });
      },
      updateItem(update) {
        set((state) => {
          const item = state.items.find(
            (h) => h.itemId === update.itemId && h.huntId === update.huntId
          );
          if (item) {
            typedAssign(item, update);
            item.amount = Math.max(item.amount, 0);
            normalizeHunt(item.huntId, state);
          }
        });
      },
      removeItem(huntId, itemId) {
        set((state) => {
          const index = state.items.findIndex(
            (h) => h.itemId === itemId && h.huntId === huntId
          );
          if (index !== -1) {
            state.items.splice(index, 1);
            normalizeHunt(huntId, state);
          }
        });
      },
      updateMonster(update) {
        set((state) => {
          const monster = state.monsters.find(
            (m) =>
              m.huntId === update.huntId && m.monsterId === update.monsterId
          );
          if (monster) {
            typedAssign(monster, update);
            monster.killsPerUnit = Math.max(monster.killsPerUnit, 0);
          }
        });
      },
    })),
    { name: "hunts" }
  )
);

function normalizeHunt(huntId: HuntId, state: HuntStore) {
  const isMatch = <T extends { huntId: HuntId }>(o: T) => o.huntId === huntId;
  const targetIds = uniq(
    state.items
      .filter(isMatch)
      .map((i) => i.targets ?? [])
      .flat()
  );
  const monsterIds = state.monsters.filter(isMatch).map((m) => m.monsterId);
  const added = without(targetIds, ...monsterIds);
  const removed = without(monsterIds, ...targetIds);
  for (const id of added) {
    state.monsters.push({ huntId, monsterId: id, killsPerUnit: 0 });
  }
  for (const id of removed) {
    const index = state.monsters.findIndex(
      (m) => isMatch(m) && m.monsterId === id
    );
    state.monsters.splice(index, 1);
  }
}

export function estimateHuntDuration({
  hunt,
  drops,
  kpxUnit,
  dropChanceMultiplier,
}: {
  hunt?: RichHunt;
  drops: Pick<ItemDrop, "ItemId" | "MonsterId" | "Rate">[];
  kpxUnit: KpxUnit;
  dropChanceMultiplier: number;
}): number | "unknown" {
  if (!hunt) {
    return "unknown";
  }
  const killsPerUnitLookup = hunt.monsters.reduce(
    (map, m) => map.set(m.monsterId, m.killsPerUnit),
    new Map<MonsterId, number>()
  );
  const itemAmountsLookup = hunt.items.reduce(
    (map, m) => map.set(m.itemId, m.amount),
    new Map<ItemId, number>()
  );

  let huntUnits: number | undefined;
  const groups = groupBy(drops, (d) => d.ItemId);
  for (const drops of Object.values(groups)) {
    const itemId = drops[0].ItemId;
    const itemAmount = itemAmountsLookup.get(itemId);
    if (itemAmount === undefined) {
      continue;
    }
    let successesPerUnit = 0;
    for (const drop of drops) {
      const attemptsPerUnit = killsPerUnitLookup.get(drop.MonsterId);
      if (attemptsPerUnit !== undefined) {
        const dropChance = (drop.Rate / 100 / 100) * dropChanceMultiplier;
        successesPerUnit += attemptsPerUnit * dropChance;
      }
    }
    if (successesPerUnit > 0) {
      if (huntUnits === undefined) {
        huntUnits = 0;
      }
      huntUnits += itemAmount / successesPerUnit;
    }
  }

  if (huntUnits === undefined) {
    return "unknown";
  } else {
    const scale = kpxUnitScales[kpxUnit];
    return huntUnits * scale;
  }
}

export interface RichHunt extends Hunt {
  items: HuntedItem[];
  monsters: HuntedMonster[];
}

export interface HuntStore {
  // Data
  hunts: Hunt[];
  items: HuntedItem[];
  monsters: HuntedMonster[];
  dropChanceMultiplier: number;
  kpxUnit: KpxUnit;

  // Queries
  getRichHunt(huntId: HuntId): RichHunt | undefined;

  // Actions
  addItems: (huntId: HuntId, items: ItemId[]) => void;
  renameHunt: (huntId: HuntId, name: string) => void;
  updateItem: (item: HuntedItem) => void;
  removeItem: (huntId: HuntId, itemId: ItemId) => void;
  updateMonster: (monster: HuntedMonster) => void;
  createHunt: () => void;
  deleteHunt: (id: HuntId) => void;
  setDropChanceMultiplier: (value: number) => void;
  setKpxUnit: (value: KpxUnit) => void;
}

export const huntIdType = zod.string();
export type HuntId = zod.infer<typeof huntIdType>;
export type Hunt = {
  id: HuntId;
  name: string;
};

export type HuntedItem = {
  huntId: HuntId;
  itemId: ItemId;
  amount: number;
  targets?: MonsterId[];
};

export type HuntedMonster = {
  huntId: HuntId;
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
