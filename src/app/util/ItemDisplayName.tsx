import { Item } from "../../api/services/item/types";

export function ItemDisplayName(props: ItemDisplayNameProps) {
  return <>{createItemDisplayName(props)}</>;
}

export interface ItemDisplayNameProps {
  item?: Item;
  name?: string;
  slots?: number;
  refine?: number;
  options?: number | any[];
}

export function createItemDisplayName({
  item,
  name = "",
  slots = 0,
  refine = 0,
  options = 0,
}: ItemDisplayNameProps) {
  if (item) {
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
