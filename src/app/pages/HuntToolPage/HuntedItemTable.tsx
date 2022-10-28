import {
  IconButton,
  LinearProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { uniqBy } from "lodash";
import { useStore } from "zustand";
import { ComponentProps } from "react";
import { ItemIdentifier } from "../../components/ItemIdentifier";
import { TextField } from "../../controls/TextField";
import { trpc } from "../../state/client";
import { MonsterIdentifier } from "../../components/MonsterIdentifier";
import { dropChanceString } from "../../grids/ItemDropGrid";
import { durationString } from "../../../lib/std/durationString";
import { InfoTooltip } from "../../components/InfoTooltip";
import { ItemDrop } from "../../../api/services/drop/types";
import { MonsterId } from "../../../api/services/monster/types";
import { HuntTableRow } from "./HuntTableRow";
import { HuntedItem, huntStore } from "./huntStore";

const targetColumnWidth = 150;

export function HuntedItemTable() {
  const { session } = useStore(huntStore);
  return (
    <Table>
      <TableHead>
        <TableRow sx={{ whiteSpace: "noWrap" }}>
          <TableCell>Item</TableCell>
          <TableCell width={110}>Current#</TableCell>
          <TableCell width={110}>Goal#</TableCell>
          <TableCell width={targetColumnWidth}>Target Monster(s)</TableCell>
          <TableCell width={100} sx={{ textAlign: "center" }}>
            Estimate
          </TableCell>
          <TableCell width={1} padding="checkbox"></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {session.items.map((hunt) => (
          <HuntedItemTableRow key={hunt.itemId} hunt={hunt} />
        ))}
      </TableBody>
    </Table>
  );
}

function HuntedItemTableRow({ hunt }: { hunt: HuntedItem }) {
  const { session, updateItem, removeItem, estimateHuntDuration } =
    useStore(huntStore);

  const { data: { entities: [item] = [] } = {}, isLoading: isItemLoading } =
    trpc.item.search.useQuery({
      filter: { Id: { value: hunt.itemId, matcher: "=" } },
    });

  const { data: { entities: allDroppers = [] } = {}, isLoading } =
    trpc.drop.search.useQuery({
      filter: { ItemId: { value: hunt.itemId, matcher: "=" } },
      sort: [{ field: "Rate", sort: "desc" }],
    });

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

  const droppersForThisItem = uniqBy(allDroppers, (d) => d.MonsterId);
  const canBeHunted = isLoading || !!droppersForThisItem.length;
  const selectedDrops = droppersForThisItem.filter((m) =>
    hunt.targets?.includes(m.MonsterId)
  );

  if (isItemLoading) {
    return (
      <HuntTableRow>
        <TableCell colSpan={5}>
          <LinearProgress />
        </TableCell>
      </HuntTableRow>
    );
  }

  const huntDuration = estimateHuntDuration(allHuntedDroppers);

  const canBeHuntedTableCells = [
    <TableCell key="amount">
      <TextField
        type="number"
        value={hunt.amount}
        onChange={(amount) => updateItem({ ...hunt, amount })}
      />
    </TableCell>,
    <TableCell key="targets">
      <MonsterSelect
        value={selectedDrops}
        options={droppersForThisItem}
        onChange={(selection) => {
          updateItem({ ...hunt, targets: selection.map((d) => d.MonsterId) });
        }}
      />
    </TableCell>,
    <TableCell key="duration">
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
    </TableCell>,
  ];

  return (
    <HuntTableRow>
      <TableCell>{item && <ItemIdentifier item={item} />}</TableCell>
      {!canBeHunted && (
        <TableCell colSpan={canBeHuntedTableCells.length}>
          Not dropped by any monster. Cannot be hunted.
        </TableCell>
      )}
      {canBeHunted && canBeHuntedTableCells}
      <TableCell padding="checkbox">
        <Tooltip title="Remove from hunt list">
          <IconButton onClick={() => removeItem(hunt.itemId)}>
            <Delete />
          </IconButton>
        </Tooltip>
      </TableCell>
    </HuntTableRow>
  );
}

function MonsterSelect({
  value,
  options,
  onChange,
}: {
  value: ItemDrop[];
  options: ItemDrop[];
  onChange: (drops: ItemDrop[]) => void;
}) {
  const selectOptions = (ids: MonsterId[]) =>
    options.filter((drop) => ids.includes(drop.MonsterId));
  return (
    <Select
      size="small"
      multiple
      value={value.map((d) => d.MonsterId)}
      onChange={(e) => {
        const { value } = e.target;
        const ids: number[] =
          typeof value === "string"
            ? value.split(",").map((str) => parseInt(str, 10))
            : value;
        onChange(selectOptions(ids));
      }}
      displayEmpty
      renderValue={(ids) => {
        if (!ids.length) {
          return <Typography color="text.secondary">Select targets</Typography>;
        }
        const [first, ...rest] = selectOptions(ids);
        return (
          <>
            <TargetIdentifier
              drop={first}
              sx={{ maxWidth: targetColumnWidth }}
            />
            {rest.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                &nbsp;+{rest.length} more
              </Typography>
            )}
          </>
        );
      }}
    >
      {options.map((drop) => (
        <MenuItem key={drop.MonsterId} value={drop.MonsterId}>
          <TargetIdentifier drop={drop} />
        </MenuItem>
      ))}
    </Select>
  );
}

function TargetIdentifier({
  drop,
  sx,
}: { drop: ItemDrop } & Pick<ComponentProps<typeof MonsterIdentifier>, "sx">) {
  return (
    <MonsterIdentifier
      name={drop.MonsterName}
      id={drop.MonsterId}
      imageUrl={drop.MonsterImageUrl}
      sx={{ whiteSpace: "nowrap", ...sx }}
    >
      &nbsp;({dropChanceString(drop.Rate)})
    </MonsterIdentifier>
  );
}
