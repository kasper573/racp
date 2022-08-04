import { createRpcController } from "../../../lib/rpc/createRpcController";
import { Item } from "../item/types";
import { dedupe, dedupeRecordInsert } from "../../util/dedupe";
import { select, Selector } from "../../util/select";
import { ClientTextNode } from "../../common/clientTextType";
import { ItemRepository } from "../item/repository";
import { MonsterRepository } from "../monster/repository";
import { metaDefinition } from "./definition";

export async function metaController({
  items,
  monsters,
}: {
  items: ItemRepository;
  monsters: MonsterRepository;
}) {
  return createRpcController(metaDefinition.entries, {
    async getMeta() {
      await items.ready;
      return collectItemMeta(Array.from(items.map.values()));
    },
  });
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

const addTag = (tags: Map<string, true>, node: ClientTextNode) =>
  node.tag ? tags.set(node.tag, true) : tags;
