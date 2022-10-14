import { Item } from "../item/types";
import { dedupe, dedupeRecordInsert } from "../../rathena/dedupe";
import { ClientTextNode } from "../../common/clientTextType";
import { ItemRepository } from "../item/repository";
import { MonsterRepository } from "../monster/repository";
import { Monster } from "../monster/types";
import { t } from "../../trpc";
import { createAsyncMemo } from "../../../lib/createMemo";
import { metaType } from "./types";

export type MetaService = ReturnType<typeof createMetaService>;

export function createMetaService({
  items,
  monsters,
}: {
  items: ItemRepository;
  monsters: MonsterRepository;
}) {
  const compileMeta = createAsyncMemo(
    () => Promise.all([items.getItems(), monsters.getMonsters()]),
    (items, monsters) => {
      return {
        ...collectItemMeta(Array.from(items.values())),
        ...collectMonsterMeta(Array.from(monsters.values())),
      };
    }
  );

  return t.router({
    read: t.procedure.output(metaType).query(compileMeta),
  });
}

function collectMonsterMeta(monsters: Monster[]) {
  return {
    sizes: options(monsters, (i) => i.Size),
    monsterModes: options(monsters, (i) => Object.keys(i.Modes ?? {})),
    monsterLevels: collectRange(monsters.map((m) => m.Level)),
    monsterWalkSpeeds: collectRange(monsters.map((m) => m.WalkSpeed ?? 0)),
    monsterAttackRanges: collectRange(monsters.map((m) => m.AttackRange)),
    monsterSkillRanges: collectRange(monsters.map((m) => m.SkillRange)),
    monsterChaseRanges: collectRange(monsters.map((m) => m.ChaseRange)),
  };
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

const collectRange = (values: number[]) => ({
  min: Math.min(0, ...values),
  max: Math.max(0, ...values),
});

const noAll = (values: string[]) => values.filter((i) => i !== "All");

const options = <T>(items: T[], selector: Selector<T, string>) =>
  noAll(dedupe(select(items, selector)));

const largestSlot = (largest: number, item: Item) =>
  item.Slots !== undefined && item.Slots > largest ? item.Slots : largest;

const addTag = (tags: Map<string, true>, node: ClientTextNode) =>
  node.tag ? tags.set(node.tag, true) : tags;

type Selector<V, S> = (value: V) => S[] | S | undefined;

function select<V, S>(values: V[], selector: Selector<V, S>) {
  return values.reduce((list, value) => {
    const selected = selector(value);
    if (Array.isArray(selected)) {
      list.push(...selected);
      return list;
    }
    if (selected !== undefined) {
      list.push(selected);
    }
    return list;
  }, [] as S[]);
}
