import { Item } from "../types";

export function itemDisplayName(
  item: string | Item,
  { slots = 0, refine = 0 }: { slots?: number; refine?: number } = {}
) {
  let name: string;
  if (typeof item === "string") {
    name = item;
  } else {
    name = item.Info?.identifiedDisplayName?.content ?? item.Name;
    slots = item.Slots ?? 0;
  }
  if (refine > 0) {
    name = `+${refine} ${name}`;
  }
  if (slots > 0) {
    name = `${name} [${slots}]`;
  }
  return name;
}
