/* eslint-disable react-hooks/rules-of-hooks */
import { IconButton, Tooltip, Typography } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { uniqBy } from "lodash";
import { useStore } from "zustand";
import { ItemIdentifierByFilter } from "../../components/ItemIdentifier";
import { TextField } from "../../controls/TextField";
import { trpc } from "../../state/client";
import { durationString } from "../../../lib/std/durationString";
import { InfoTooltip } from "../../components/InfoTooltip";
import { ColumnConventionProps, DataGrid } from "../../components/DataGrid";
import { ItemId } from "../../../api/services/item/types";
import { HuntedItem, huntStore } from "./huntStore";
import { DropperSelect } from "./DropperSelect";

export function HuntedItemGrid() {
  const { session } = useStore(huntStore);

  return (
    <DataGrid<HuntedItem>
      id={(item) => item.itemId}
      data={session.items}
      columns={columns}
    />
  );
}

const columns: ColumnConventionProps<HuntedItem, ItemId>["columns"] = {
  itemId: {
    headerName: "Item",
    renderCell({ row: hunt }) {
      return (
        <ItemIdentifierByFilter
          filter={{ Id: { value: hunt.itemId, matcher: "=" } }}
        />
      );
    },
  },
  amount: {
    ...forceWidth(120),
    headerName: "Amount",
    renderCell({ row: hunt }) {
      const { updateItem } = useStore(huntStore);
      return (
        <TextField
          type="number"
          value={hunt.amount}
          onChange={(amount) => updateItem({ ...hunt, amount })}
        />
      );
    },
  },
  targets: {
    headerName: "Target Monster(s)",
    minWidth: 200,
    sortable: false,
    renderCell({ row: hunt }) {
      const { updateItem } = useStore(huntStore);
      const { canBeHunted, selected, options } = useDroppersForHunt(hunt);
      if (!canBeHunted) {
        return (
          <InfoTooltip title="No monster drops this item">
            Cannot be hunted
          </InfoTooltip>
        );
      }
      return (
        <DropperSelect
          value={selected}
          options={options}
          onChange={(selection) => {
            updateItem({
              ...hunt,
              targets: selection.map((d) => d.MonsterId),
            });
          }}
        />
      );
    },
  },
  estimate: {
    headerName: "Estimate",
    field: "estimate",
    sortable: false,
    ...forceWidth(100),
    renderCell({ row: hunt }) {
      const { session, estimateHuntDuration } = useStore(huntStore);
      const { data: { entities: allHuntedDroppers = [] } = {} } =
        trpc.drop.search.useQuery({
          filter: {
            ItemId: { value: hunt.itemId, matcher: "=" },
            MonsterId: {
              value: session.monsters.map((m) => m.monsterId),
              matcher: "oneOfN",
            },
          },
        });
      const huntDuration = estimateHuntDuration(allHuntedDroppers);
      return (
        <Typography noWrap textAlign="center">
          {huntDuration === "unknown" ? (
            <InfoTooltip
              title={
                "Not enough data to estimate hunt duration. " +
                "Make sure you have selected monster targets and specified KPMs."
              }
            >
              ?
            </InfoTooltip>
          ) : huntDuration <= 0 ? (
            "Done"
          ) : (
            durationString(huntDuration, 2)
          )}
        </Typography>
      );
    },
  },
  actions: {
    sortable: false,
    headerName: "",
    field: "actions",
    ...forceWidth(57),
    renderCell({ row: hunt }) {
      const { removeItem } = useStore(huntStore);
      return (
        <Tooltip title="Remove from hunt list">
          <IconButton onClick={() => removeItem(hunt.itemId)}>
            <Delete />
          </IconButton>
        </Tooltip>
      );
    },
  },
};

function forceWidth(n: number) {
  return {
    minWidth: n,
    width: n,
    maxWidth: n,
  };
}

function useDroppersForHunt(hunt: HuntedItem) {
  const { data: { entities: all = [] } = {}, isLoading } =
    trpc.drop.search.useQuery({
      filter: { ItemId: { value: hunt.itemId, matcher: "=" } },
      sort: [{ field: "Rate", sort: "desc" }],
    });

  const options = uniqBy(all, (d) => d.MonsterId);
  const canBeHunted = isLoading || !!options.length;
  const selected = options.filter((m) => hunt.targets?.includes(m.MonsterId));
  return { canBeHunted, selected, options };
}
