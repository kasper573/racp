import { createStore, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { groupBy } from "lodash";
import { MonsterId } from "../../../api/services/monster/types";
import { ItemId } from "../../../api/services/item/types";
import { ItemDrop } from "../../../api/services/drop/types";
import { RichHunt } from "../../../api/services/hunt/types";
import { authStore } from "../../state/auth";

export const huntStore = createStore<{
  kpxUnit: KpxUnit;
  dropChanceMultiplier: number;
  setKpxUnit: (unit: KpxUnit) => void;
  setDropChanceMultiplier: (value: number) => void;
}>()(
  persist(
    immer((set) => ({
      kpxUnit: "Kills per minute",
      dropChanceMultiplier: 1,
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
    })),
    { name: "hunts" }
  )
);

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

export function useIsHuntOwner(hunt?: RichHunt) {
  const { profile } = useStore(authStore);
  return hunt && profile && hunt.accountId === profile.id;
}
