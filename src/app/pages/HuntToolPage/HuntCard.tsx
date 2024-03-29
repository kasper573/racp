import { Add, Delete } from "@mui/icons-material";
import { ComponentProps } from "react";
import {
  CardActions,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Hunt } from "@prisma/client";
import { CardListItem } from "../../components/CardList";
import { Center } from "../../components/Center";
import { LinkButton } from "../../components/Link";
import { routes } from "../../router";
import { ItemIdentifierByFilter } from "../../components/ItemIdentifier";
import { MonsterIdentifierByFilter } from "../../components/MonsterIdentifier";
import { trpc } from "../../state/client";

export function HuntCard({
  hunt,
  onDelete,
}: {
  hunt: Hunt;
  onDelete?: (hunt: Hunt) => void;
}) {
  return (
    <CardListItem sx={{ display: "flex", flexDirection: "column" }}>
      <CardContent
        sx={{ flex: 1, pb: 0, overflow: "hidden" }}
        style={{ marginBottom: 2 }}
      >
        <Typography
          variant="h6"
          sx={{
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            mb: 1,
          }}
        >
          {hunt.name}
        </Typography>
        <HuntSummary id={hunt.id} />
      </CardContent>
      <CardActions>
        <LinkButton
          aria-label="View list"
          to={routes.tools.itemTracker.view.$({ id: hunt.id })}
          sx={{ mr: "auto" }}
        >
          View
        </LinkButton>
        <Tooltip title={`Delete "${hunt.name}"`}>
          <IconButton aria-label="Delete list" onClick={() => onDelete?.(hunt)}>
            <Delete />
          </IconButton>
        </Tooltip>
      </CardActions>
    </CardListItem>
  );
}

export function AddHuntCard({
  sx,
  ...props
}: ComponentProps<typeof CardListItem>) {
  return (
    <CardListItem
      role="button"
      aria-label="Create new list"
      sx={{ cursor: "pointer", ...sx }}
      {...props}
    >
      <Center>
        <Tooltip title="Create new list">
          <Add sx={{ fontSize: 96 }} />
        </Tooltip>
      </Center>
    </CardListItem>
  );
}

function HuntSummary({ id }: { id: Hunt["id"] }) {
  const { data: hunt } = trpc.hunt.read.useQuery(id);
  if (!hunt) {
    return null;
  }
  const itemIds = hunt.items.map((i) => i.itemId);
  const monsterIds = hunt.monsters.map((m) => m.monsterId);
  const size = itemIds.length + monsterIds.length;
  if (!size) {
    return <i>This list is empty.</i>;
  }
  const sx = { mb: 2 };
  return (
    <>
      {itemIds.map((itemId) => (
        <ItemIdentifierByFilter
          sx={sx}
          showLabelAsTooltip
          key={`item-${itemId}`}
          loader=""
          filter={{
            Id: { value: itemId, matcher: "=" },
          }}
        />
      ))}
      {monsterIds.map((monsterId) => (
        <MonsterIdentifierByFilter
          sx={sx}
          showLabelAsTooltip
          key={`monster-${monsterId}`}
          loader=""
          filter={{
            Id: { value: monsterId, matcher: "=" },
          }}
        />
      ))}
    </>
  );
}
