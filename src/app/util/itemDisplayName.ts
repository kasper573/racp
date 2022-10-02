import { Item } from "../../api/services/item/types";

export function itemDisplayName(
  item: string | Item,
  {
    slots = 0,
    refine = 0,
    options = 0,
  }: { slots?: number; refine?: number; options?: number | Array<any> } = {}
) {
  let name: string;
  if (typeof item === "string") {
    name = item;
  } else {
    name = item.Name;
    slots = item.Slots ?? 0;
  }
  if (refine > 0) {
    name = `+${refine} ${name}`;
  }
  if (slots > 0) {
    name = `${name} [${slots}]`;
  }
  if (Array.isArray(options)) {
    options = options.length;
  }
  if (options > 0) {
    name = `${name} [${options} ea]`;
  }
  return name;
}
