import { Item, ItemId } from "../../../api/services/item/types";
import { Monster, MonsterId } from "../../../api/services/monster/types";

export type HuntSession = {
  items: HuntedItem[];
  monsters: HuntedMonster[];
};

export type HuntedItem = {
  itemId: ItemId;
  current: number;
  goal: number;
  target?: MonsterId;
};

export type HuntedMonster = {
  monsterId: MonsterId;
  killsPerMinute: number;
};

export function createHuntedItem(item: Item | ItemId): HuntedItem {
  return {
    itemId: typeof item === "number" ? item : item.Id,
    current: 0,
    goal: 1,
  };
}

export function createHuntedMonster(monster: Monster): HuntedMonster {
  return {
    monsterId: monster.Id,
    killsPerMinute: 0,
  };
}
