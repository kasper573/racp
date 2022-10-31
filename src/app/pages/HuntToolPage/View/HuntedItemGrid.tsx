/* eslint-disable react-hooks/rules-of-hooks */
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { uniqBy } from "lodash";
import { useStore } from "zustand";
import { HuntedItem } from "@prisma/client";
import { useEffect, useState } from "react";
import { ItemIdentifierByFilter } from "../../../components/ItemIdentifier";
import { TextField } from "../../../controls/TextField";
import { trpc } from "../../../state/client";
import { durationString } from "../../../../lib/std/durationString";
import { InfoTooltip } from "../../../components/InfoTooltip";
import { ColumnConventionProps, DataGrid } from "../../../components/DataGrid";
import { ItemId } from "../../../../api/services/item/types";
import { estimateHuntDuration, huntStore } from "../huntStore";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { DropperSelect } from "./DropperSelect";

export function HuntedItemGrid({ items }: { items: HuntedItem[] }) {
  return (
    <DataGrid<HuntedItem>
      id={(item) => item.itemId}
      data={items}
      emptyComponent={Empty}
      columns={columns}
    />
  );
}

const Empty = () => (
  <Box sx={{ textAlign: "center" }}>No items have been added to the hunt.</Box>
);

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
      const { mutate: updateItem } = trpc.hunt.updateItem.useMutation();
      return (
        <TextField
          type="number"
          value={hunt.amount}
          onChange={(amount) => updateItem({ ...hunt, amount })}
        />
      );
    },
  },
  targetMonsterIds: {
    headerName: "Target Monster(s)",
    minWidth: 200,
    sortable: false,
    renderCell({ row: hunt }) {
      const updateItem = trpc.hunt.updateItem.useMutation();
      const { canBeHunted, selected, options } = useDroppersForHunt(hunt);
      const [dialogError, setDialogError] = useState<unknown>();
      useEffect(() => setDialogError(updateItem.error), [updateItem.error]);

      if (!canBeHunted) {
        return (
          <InfoTooltip title="No monster drops this item">
            Cannot be hunted
          </InfoTooltip>
        );
      }

      return (
        <>
          <Dialog open={!!dialogError}>
            <DialogTitle>Error</DialogTitle>
            <DialogContent>
              <ErrorMessage error={dialogError} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogError(undefined)}>Close</Button>
            </DialogActions>
          </Dialog>
          <DropperSelect
            value={selected}
            options={options}
            onChange={(selection) => {
              const monsterIds = selection.map((d) => d.MonsterId);
              updateItem.mutate({
                ...hunt,
                targetMonsterIds: monsterIds.join(","),
              });
            }}
          />
        </>
      );
    },
  },
  estimate: {
    headerName: "Estimate",
    field: "estimate",
    sortable: false,
    ...forceWidth(115),
    renderCell({ row: huntedItem }) {
      const { data: hunt } = trpc.hunt.richHunt.useQuery(huntedItem.huntId);
      const huntState = useStore(huntStore);
      const { data: { entities: drops = [] } = {} } = trpc.drop.search.useQuery(
        {
          filter: {
            ItemId: { value: huntedItem.itemId, matcher: "=" },
            MonsterId: {
              matcher: "oneOfN",
              value: hunt?.monsters.map((m) => m.monsterId) ?? [],
            },
          },
        },
        { enabled: !!hunt }
      );

      const huntDuration = estimateHuntDuration({ hunt, drops, ...huntState });
      return (
        <Typography noWrap textAlign="center">
          {huntDuration === "unknown" ? (
            <InfoTooltip
              title={
                "Not enough data to estimate hunt duration. " +
                `Make sure you have selected monster targets and specified ${huntState.kpxUnit}.`
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
    renderCell({ row: item }) {
      const { mutate: removeItem } = trpc.hunt.removeItem.useMutation();
      return (
        <Tooltip title="Remove from hunt list">
          <IconButton onClick={() => removeItem(item)}>
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
  const selected = options.filter((m) => {
    const ids = hunt.targetMonsterIds.split(",").map(parseFloat);
    return ids.includes(m.MonsterId);
  });
  return { canBeHunted, selected, options };
}
