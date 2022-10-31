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
import {
  estimateHuntDuration,
  huntEditorStore,
  useIsHuntOwner,
} from "../huntEditorStore";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { joinNodes } from "../../../../lib/joinNodes";
import { DropperIdentifier, DropperSelect } from "./DropperSelect";

export function HuntedItemGrid({ items }: { items: HuntedItem[] }) {
  return (
    <DataGrid<HuntedItem>
      aria-label="items"
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
    renderCell({ row: item }) {
      const { mutate: updateItem } = trpc.hunt.updateItem.useMutation();
      const { data: hunt } = trpc.hunt.read.useQuery(item.huntId);
      const mayEdit = useIsHuntOwner(hunt);
      if (!mayEdit) {
        return item.amount;
      }
      return (
        <TextField
          type="number"
          value={item.amount}
          id="ItemAmount"
          onChange={(amount) => updateItem({ id: item.id, amount })}
        />
      );
    },
  },
  targetMonsterIds: {
    headerName: "Target Monster(s)",
    minWidth: 200,
    sortable: false,
    renderCell({ row: item }) {
      const { data: hunt } = trpc.hunt.read.useQuery(item.huntId);
      const mayEdit = useIsHuntOwner(hunt);
      const updateItem = trpc.hunt.updateItem.useMutation();
      const { canBeHunted, selected, options } = useDroppersForHunt(item);
      const [dialogError, setDialogError] = useState<unknown>();
      useEffect(() => setDialogError(updateItem.error), [updateItem.error]);

      if (!canBeHunted) {
        return (
          <InfoTooltip title="No monster drops this item">
            Cannot be hunted
          </InfoTooltip>
        );
      }

      if (!mayEdit) {
        return (
          <>
            {joinNodes(
              selected
                .map((dropper) => (
                  <DropperIdentifier drop={dropper} showLabelAsTooltip link />
                ))
                .slice(0, 4),
              ""
            )}
            {selected.length > 4 && `+ ${selected.length - 4} more`}
          </>
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
            id="ItemTargets"
            value={selected}
            options={options}
            onChange={(selection) => {
              const monsterIds = selection.map((d) => d.MonsterId);
              updateItem.mutate({
                id: item.id,
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
      const { data: hunt } = trpc.hunt.read.useQuery(huntedItem.huntId);
      const huntState = useStore(huntEditorStore);
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
      const { data: hunt } = trpc.hunt.read.useQuery(item.huntId);
      const mayEdit = useIsHuntOwner(hunt);
      if (!mayEdit) {
        return;
      }
      return (
        <Tooltip title="Remove item from hunt list">
          <IconButton aria-label="Remove item" onClick={() => removeItem(item)}>
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
