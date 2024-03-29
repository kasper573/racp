import { Paper, Tooltip, Typography } from "@mui/material";
import { ComponentProps, forwardRef, HTMLAttributes, ReactNode } from "react";
import { routes } from "../router";
import {
  Item,
  ItemFilter,
  ItemOptionTexts,
} from "../../api/services/item/types";
import { ItemDrop } from "../../api/services/drop/types";
import { VendorItem } from "../../api/services/vendor/types";
import {
  ItemInstanceProperties,
  ItemOptionInstance,
} from "../../api/services/inventory/types";
import { trpc } from "../state/client";
import { ShopItem } from "../../api/services/shop/types";
import { Link } from "./Link";
import { IconWithLabel } from "./IconWithLabel";
import { LoadingIndicator } from "./LoadingIndicator";

export type ItemIdentifierBaseProps = Pick<
  ComponentProps<typeof IconWithLabel>,
  "sx" | "style" | "className" | "showLabelAsTooltip"
> & {
  link?: boolean;
};

export type ItemIdentifierProps = ItemIdentifierBaseProps &
  (
    | ({ item: Item } & Omit<ItemDisplayNameProps, "name" | "slots">)
    | ({ drop: ItemDrop } & Omit<ItemDisplayNameProps, "name" | "slots">)
    | { shopItem: ShopItem }
    | { vendorItem: VendorItem }
  );

export function ItemIdentifier({
  link = true,
  sx,
  style,
  className,
  showLabelAsTooltip,
  ...input
}: ItemIdentifierProps) {
  let id: number;
  let imageUrl: string | undefined;
  let props: ItemDisplayNameProps;
  if ("item" in input) {
    id = input.item.Id;
    imageUrl = input.item.ImageUrl;
    props = { name: input.item.Name, slots: input.item.Slots };
  } else if ("drop" in input) {
    id = input.drop.ItemId;
    imageUrl = input.drop.ImageUrl;
    props = { name: input.drop.ItemName, slots: input.drop.Slots };
  } else if ("shopItem" in input) {
    id = input.shopItem.id;
    imageUrl = input.shopItem.imageUrl;
    props = input.shopItem;
  } else {
    id = input.vendorItem.itemId;
    imageUrl = input.vendorItem.imageUrl;
    props = input.vendorItem;
  }

  let displayName = <ItemDisplayName {...props} />;
  if (link) {
    displayName = <Link to={routes.item.view({ id })}>{displayName}</Link>;
  }

  const { cardIds, options } = props;
  if (cardIds?.length || options?.length) {
    displayName = (
      <Tooltip
        components={{ Tooltip: Blank }}
        title={<TooltipContent cardIds={cardIds} options={options} />}
      >
        <span>{displayName}</span>
      </Tooltip>
    );
  }

  return (
    <IconWithLabel
      src={imageUrl}
      alt={props.name}
      showLabelAsTooltip={showLabelAsTooltip}
      {...{ sx, style, className }}
    >
      {displayName}
    </IconWithLabel>
  );
}

export function ItemIdentifierByName({
  name = "",
  ...props
}: Omit<ItemIdentifierByFilterProps, "filter"> & { name?: string }) {
  if (!name) {
    return null;
  }
  return (
    <ItemIdentifierByFilter
      fallback={name}
      filter={{
        NameList: {
          value: name,
          matcher: "someItemEquals",
          options: { caseSensitive: false },
        },
      }}
      {...props}
    />
  );
}

export interface ItemIdentifierByFilterProps extends ItemIdentifierBaseProps {
  filter: ItemFilter;
  fallback?: ReactNode;
  loader?: ReactNode;
}

export function ItemIdentifierByFilter({
  filter,
  fallback = "Unknown item",
  loader = <LoadingIndicator variant="linear" />,
  ...props
}: ItemIdentifierByFilterProps) {
  const { data: { entities: [item] = [] } = {}, isLoading } =
    trpc.item.search.useQuery({
      filter: filter,
      limit: 1,
    });
  if (item) {
    return <ItemIdentifier item={item} {...props} />;
  }
  if (isLoading) {
    return <>{loader}</>;
  }
  if (fallback) {
    return <>{fallback}</>;
  }
  return null;
}

// Clears the default tooltip container
const Blank = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, style, className }, ref) => (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  )
);

function TooltipContent({
  cardIds = [],
  options = [],
  ...props
}: ComponentProps<typeof Paper> &
  Pick<ItemDisplayNameProps, "cardIds" | "options">) {
  const itemQueryEnabled = cardIds.length > 0;
  const itemQuery = trpc.item.search.useQuery(
    {
      filter: { Id: { value: cardIds, matcher: "oneOfN" } },
      limit: cardIds.length,
    },
    { enabled: itemQueryEnabled }
  );

  const textsQueryEnabled = options.length > 0;
  const textsQuery = trpc.item.getOptionTexts.useQuery(undefined, {
    enabled: textsQueryEnabled,
  });

  const { data: { entities: cards = [] } = {} } = itemQuery;
  const { data: optionTexts = {} } = textsQuery;
  const isLoading =
    (itemQueryEnabled && itemQuery.isLoading) ||
    (textsQueryEnabled && textsQuery.isLoading);

  return (
    <Paper
      aria-label="Item tooltip"
      sx={{
        padding: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      elevation={1}
      {...props}
    >
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          {cards.map((item, index) => (
            <ItemIdentifier key={`card${index}`} item={item} />
          ))}
          {options.map((option, index) => (
            <Typography key={`option${index}`}>
              {resolveItemOption(optionTexts, option)}
            </Typography>
          ))}
        </>
      )}
    </Paper>
  );
}

export function ItemDisplayName({
  name,
  slots = 0,
  refine = 0,
  options = [],
  cardIds = [],
}: ItemDisplayNameProps) {
  if (refine > 0) {
    name = `+${refine} ${name}`;
  }
  if (slots > 0) {
    name =
      cardIds.length > 0
        ? `${name} [${cardIds.length}/${slots}]`
        : `${name} [${slots}]`;
  }
  if (options.length > 0) {
    name = `${name} [${options.length} ea]`;
  }
  return <>{name}</>;
}

function resolveItemOption(
  texts: ItemOptionTexts,
  instance: ItemOptionInstance
) {
  const text = texts[instance.id];
  if (!text) {
    return "Unknown option";
  }
  return text.replace("%d", instance.value.toString()).replace("%%", "%");
}

export interface ItemDisplayNameProps extends Partial<ItemInstanceProperties> {
  name: string;
  slots?: number;
}
