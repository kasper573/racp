import { Tooltip, Typography } from "@mui/material";
import { Item } from "../../api/services/item/types";
import { ItemRandomOption } from "../../api/services/inventory/types";

export function ItemDisplayName(props: ItemDisplayNameProps) {
  let displayName = <>{createItemDisplayName(props)}</>;
  const tooltipContent = createTooltipContent(props);
  if (tooltipContent) {
    displayName = (
      <Tooltip title={tooltipContent}>
        <span>{displayName}</span>
      </Tooltip>
    );
  }
  return displayName;
}

export interface ItemDisplayNameProps {
  item?: Item;
  name?: string;
  slots?: number;
  refine?: number;
  options?: number | ItemRandomOption[];
  cardIds?: number[];
}

export function createItemDisplayName({
  item,
  name = "",
  slots = 0,
  refine = 0,
  options = 0,
  cardIds = [],
}: ItemDisplayNameProps) {
  if (item) {
    name = item.Name;
    slots = item.Slots ?? 0;
  }
  if (refine > 0) {
    name = `+${refine} ${name}`;
  }
  if (slots > 0) {
    name =
      cardIds.length > 0
        ? `${name} [${cardIds.length}/${slots}]`
        : `${name} [${slots}]`;
  }
  if (Array.isArray(options)) {
    options = options.length;
  }
  if (options > 0) {
    name = `${name} [${options} ea]`;
  }
  return name;
}

function createTooltipContent({ cardIds, options }: ItemDisplayNameProps) {
  const rows: string[] = [];
  if (cardIds?.length) {
    rows.push(`Cards: ${cardIds.join(", ")}`);
  }
  if (Array.isArray(options)) {
    rows.push(...options.map((option) => `${option.id}: ${option.value}`));
  }
  if (rows.length) {
    return <Typography whiteSpace="pre">{rows.join("\n")}</Typography>;
  }
}
