import { Tooltip, Typography } from "@mui/material";
import { router } from "../router";
import { Item } from "../../api/services/item/types";
import { ItemDrop } from "../../api/services/drop/types";
import { VendorItem } from "../../api/services/vendor/types";
import { ItemRandomOption } from "../../api/services/inventory/types";
import { trpc } from "../state/client";
import { Link } from "./Link";
import { IconWithLabel } from "./IconWithLabel";

export type ItemIdentifierProps = { link?: boolean } & (
  | ({ item: Item } & Omit<ItemDisplayNameProps, "name" | "slots">)
  | ({ drop: ItemDrop } & Omit<ItemDisplayNameProps, "name" | "slots">)
  | { vendorItem: VendorItem }
);

export function ItemIdentifier({ link = true, ...input }: ItemIdentifierProps) {
  let id: number;
  let imageUrl: string | undefined;
  let props: ItemDisplayNameProps;
  if ("item" in input) {
    id = input.item.Id;
    imageUrl = input.item.ImageUrl;
    props = { name: input.item.Name, ...input.item };
  } else if ("drop" in input) {
    id = input.drop.ItemId;
    imageUrl = input.drop.ImageUrl;
    props = { name: input.drop.ItemName, ...input.drop };
  } else {
    id = input.vendorItem.itemId;
    imageUrl = input.vendorItem.imageUrl;
    props = input.vendorItem;
  }

  let displayName = <>{createItemDisplayName(props)}</>;
  const tooltipContent = useTooltipContent(props);
  if (tooltipContent) {
    displayName = (
      <Tooltip title={tooltipContent}>
        <span>{displayName}</span>
      </Tooltip>
    );
  }
  if (link) {
    displayName = <Link to={router.item().view({ id })}>{displayName}</Link>;
  }

  return (
    <IconWithLabel src={imageUrl} alt={props.name}>
      {displayName}
    </IconWithLabel>
  );
}

export interface ItemDisplayNameProps {
  name: string;
  slots?: number;
  refine?: number;
  options?: ItemRandomOption[];
  cards?: number[];
}

export function createItemDisplayName({
  name,
  slots = 0,
  refine = 0,
  options = [],
  cards = [],
}: ItemDisplayNameProps) {
  if (refine > 0) {
    name = `+${refine} ${name}`;
  }
  if (slots > 0) {
    name =
      cards.length > 0
        ? `${name} [${cards.length}/${slots}]`
        : `${name} [${slots}]`;
  }
  if (options.length > 0) {
    name = `${name} [${options.length} ea]`;
  }
  return name;
}

function useTooltipContent({
  cardIds = [],
  options = [],
}: {
  cardIds?: number[];
  options?: ItemRandomOption[];
}) {
  const { data: { entities: cards = [] } = {} } = trpc.item.search.useQuery(
    {
      filter: { Id: { value: cardIds, matcher: "oneOfN" } },
      limit: cardIds.length,
    },
    { enabled: cardIds.length > 0 }
  );

  if (cards.length === 0 && options.length === 0) {
    return null;
  }

  return (
    <Typography variant="body1" aria-label="Item tooltip" component="div">
      {cards.map((item, index) => (
        <ItemIdentifier key={`card${index}`} item={item} />
      ))}
      {options.map((option, index) => (
        <Typography key={`option${index}`}>
          {option.id}: {option.value}
        </Typography>
      ))}
    </Typography>
  );
}
