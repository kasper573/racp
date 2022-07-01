import { RAES } from "../../raes";
import { createRpcHandlers } from "../../../lib/rpc/createRpcHandlers";
import { RpcException } from "../../../lib/rpc/RpcException";
import { collectUnique } from "../../../lib/collectUnique";
import { createSearchHandler } from "../search/search.handlers";
import { itemDefinition } from "./item.definition";
import { Item, ItemFilter, itemType } from "./item.types";

export function createItemHandlers({
  raes: { resolve },
  tradeScale,
}: {
  raes: RAES;
  tradeScale: number;
}) {
  const items = resolve("db/item_db.yml", itemType, (o) => o.Id, setDefaults);
  const meta = collectItemMeta(Array.from(items.values()));

  function setDefaults(item: Item) {
    item.Buy = item.Buy ?? (item.Sell ?? 0) * tradeScale;
    item.Sell = item.Sell ?? (item.Buy ?? 0) / tradeScale;
  }

  return createRpcHandlers(itemDefinition.entries, {
    async getItemMeta() {
      return meta;
    },
    searchItems: createSearchHandler(
      Array.from(items.values()),
      isMatchingItem
    ),
    async getItem(itemId) {
      const item = items.get(itemId);
      if (!item) {
        throw new RpcException("Invalid item id");
      }
      return item;
    },
  });
}

function isMatchingItem(item: Item, filter: ItemFilter): boolean {
  if (filter.Id !== undefined && filter.Id !== item.Id) {
    return false;
  }
  return true;
}

function collectItemMeta(items: Item[]) {
  return {
    types: collectItemTypes(items),
    maxSlots: items.reduce(largestSlot, 0),
    ...collectUnique(items, {
      genders: (item) => (item.Gender ? [item.Gender] : []),
      classes: (item) => Object.keys(item.Classes ?? {}),
      jobs: (item) => Object.keys(item.Jobs ?? {}),
      locations: (item) => Object.keys(item.Locations ?? {}),
    }),
  };
}

function collectItemTypes(items: Item[]) {
  const types: Record<string, string[]> = {};
  for (const item of items) {
    if (item.Type) {
      const subTypes: string[] = types[item.Type] || (types[item.Type] = []);
      if (item.SubType && !subTypes.includes(item.SubType)) {
        subTypes.push(item.SubType);
      }
    }
  }
  return types;
}

const largestSlot = (largest: number, item: Item) =>
  item.Slots !== undefined && item.Slots > largest ? item.Slots : largest;
