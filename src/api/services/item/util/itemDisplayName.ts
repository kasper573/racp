import { Item } from "../types";

export function itemDisplayName(item: string | Item, slots?: number) {
  let name: string;
  if (typeof item === "string") {
    name = item;
  } else {
    name = item.Info?.identifiedDisplayName?.content ?? item.Name;
    slots = item.Slots;
  }
  return slots !== undefined ? `${name} [${slots}]` : name;
}
