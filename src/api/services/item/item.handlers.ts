import { RAES } from "../../raes";
import { createRpcHandlers } from "../../../lib/rpc/createRpcHandlers";
import { RpcException } from "../../../lib/rpc/RpcException";
import { createSearchHandler } from "../search/search.handlers";
import { dedupe, dedupeRecordInsert } from "../../dedupe";
import { select, Selector } from "../../../lib/select";
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
    genders: filter(items, (i) => i.Gender),
    classes: filter(items, (i) => Object.keys(i.Classes ?? {})),
    jobs: filter(items, (item) => Object.keys(item.Jobs ?? {})),
    locations: filter(items, (i) => Object.keys(i.Locations ?? {})),
    elements: filter(items, ({ Script }) => Script?.meta.elements),
    statuses: filter(items, ({ Script }) => Script?.meta.statuses),
    races: filter(items, ({ Script }) => Script?.meta.races),
  };
}

function collectItemTypes(items: Item[]) {
  const types: Record<string, string[]> = {};
  for (const item of items) {
    dedupeRecordInsert(types, item.Type, item.SubType);
  }
  return types;
}

const noAll = (values: string[]) => values.filter((i) => i !== "All");
const filter = (items: Item[], selector: Selector<Item, string>) =>
  noAll(dedupe(select(items, selector)));

const largestSlot = (largest: number, item: Item) =>
  item.Slots !== undefined && item.Slots > largest ? item.Slots : largest;
