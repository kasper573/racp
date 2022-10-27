import { Item, ItemId } from "../../../api/services/item/types";
import { MonsterId } from "../../../api/services/monster/types";

export type HuntSession = {
  items: HuntedItem[];
  kpm: Map<MonsterId, number>;
};

export type HuntedItem = {
  itemId: ItemId;
  current: number;
  goal: number;
  targets?: MonsterId[];
};

export function createHuntedItem(item: Item | ItemId): HuntedItem {
  return {
    itemId: typeof item === "number" ? item : item.Id,
    current: 0,
    goal: 1,
  };
}
