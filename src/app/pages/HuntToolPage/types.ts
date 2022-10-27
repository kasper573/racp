import { Item, ItemId } from "../../../api/services/item/types";
import {
  Monster,
  MonsterId,
  MonsterSpawnId,
} from "../../../api/services/monster/types";

export type HuntSession = {
  items: HuntedItem[];
  monsters: HuntedMonster[];
};

export type HuntedItem = {
  id: ItemId;
  current: number;
  goal: number;
  targetSpawnId?: MonsterSpawnId;
};

export type HuntedMonster = {
  id: MonsterId;
  killsPerMinute: number;
};

export function createHuntedItem(item: Item | ItemId): HuntedItem {
  return {
    id: typeof item === "number" ? item : item.Id,
    current: 0,
    goal: 1,
  };
}

export function createHuntedMonster(monster: Monster): HuntedMonster {
  return {
    id: monster.Id,
    killsPerMinute: 0,
  };
}
