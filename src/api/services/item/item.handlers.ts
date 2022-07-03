import { RAES } from "../raes";
import { createRpcHandlers } from "../../../lib/rpc/createRpcHandlers";
import { RpcException } from "../../../lib/rpc/RpcException";
import { createSearchHandler } from "../search/search.handlers";
import { dedupe, dedupeRecordInsert } from "../../util/dedupe";
import { select, Selector } from "../../util/select";
import {
  isArrayMatch,
  isRangeMatch,
  isRefMatch,
  isStringMatch,
  isToggleMatch,
} from "../search/search.matchers";
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
  return (
    isRefMatch(filter.id, item.Id) &&
    isStringMatch(filter.name, item.Name) &&
    isArrayMatch(filter.types, item.Type) &&
    isArrayMatch(filter.subTypes, item.SubType) &&
    isToggleMatch(filter.classes, item.Classes) &&
    isToggleMatch(filter.jobs, item.Jobs) &&
    isArrayMatch(filter.elements, item.Script?.meta.elements) &&
    isArrayMatch(filter.statuses, item.Script?.meta.statuses) &&
    isArrayMatch(filter.races, item.Script?.meta.races) &&
    isRangeMatch(filter.slots, item.Slots) &&
    (isStringMatch(filter.script, item.Script?.raw) ||
      isStringMatch(filter.script, item.EquipScript?.raw) ||
      isStringMatch(filter.script, item.UnEquipScript?.raw))
  );
}

function collectItemMeta(items: Item[]) {
  return {
    types: collectItemTypes(items),
    maxSlots: items.reduce(largestSlot, 0),
    genders: options(items, (i) => i.Gender),
    classes: options(items, (i) => Object.keys(i.Classes ?? {})),
    jobs: options(items, (item) => Object.keys(item.Jobs ?? {})),
    locations: options(items, (i) => Object.keys(i.Locations ?? {})),
    elements: options(items, ({ Script }) => Script?.meta.elements),
    statuses: options(items, ({ Script }) => Script?.meta.statuses),
    races: options(items, ({ Script }) => Script?.meta.races),
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
const options = (items: Item[], selector: Selector<Item, string>) =>
  noAll(dedupe(select(items, selector)));

const largestSlot = (largest: number, item: Item) =>
  item.Slots !== undefined && item.Slots > largest ? item.Slots : largest;
