import { dedupe, dedupeRecordInsert } from "../../../util/dedupe";
import { select, Selector } from "../../../util/select";
import { Item } from "../types";

export function collectItemMeta(items: Item[]) {
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
