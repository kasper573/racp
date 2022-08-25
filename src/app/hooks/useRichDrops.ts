import { useMemo } from "react";
import { groupBy, uniq } from "lodash";
import { Monster, MonsterDrop } from "../../api/services/monster/types";
import { useSearchItemsQuery } from "../state/client";
import { DataGridQueryFn } from "../components/DataGrid";
import { Item, ItemFilter } from "../../api/services/item/types";
import { defined } from "../../lib/defined";

export type RichDrop = Omit<MonsterDrop, "Item"> & Item;

export function useRichDrops(monster?: Monster): RichDrop[] {
  const drops = useMemo(
    () => [...(monster?.Drops ?? []), ...(monster?.MvpDrops ?? [])],
    [monster]
  );

  const aegisNames = useMemo(
    () => uniq(drops.map((drop) => drop.Item)),
    [drops]
  );

  const { data: { entities: items = empty } = {} } = (
    useSearchItemsQuery as unknown as DataGridQueryFn<Item, ItemFilter>
  )({
    filter: { AegisName: { value: aegisNames, matcher: "oneOf" } },
    limit: drops.length,
  });

  const itemsByAegis = useMemo(
    () => groupBy(items, (item) => item.AegisName),
    [items]
  );

  return defined(
    drops.map((drop) => {
      const item = itemsByAegis[drop.Item]?.[0];
      return item ? { ...item, ...drop } : undefined;
    })
  );
}

const empty: Item[] = [];
