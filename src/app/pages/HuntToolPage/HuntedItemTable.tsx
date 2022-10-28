import {
  Autocomplete,
  IconButton,
  LinearProgress,
  Popper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField as MuiTextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { uniqBy } from "lodash";
import { useStore } from "zustand";
import { ItemIdentifier } from "../../components/ItemIdentifier";
import { TextField } from "../../controls/TextField";
import { trpc } from "../../state/client";
import { MonsterIdentifier } from "../../components/MonsterIdentifier";
import { dropChanceString } from "../../grids/ItemDropGrid";
import { ItemDrop } from "../../../api/services/drop/types";
import { durationString } from "../../../lib/std/durationString";
import { InfoTooltip } from "../../components/InfoTooltip";
import { HuntTableRow } from "./HuntTableRow";
import { HuntedItem, huntStore } from "./huntStore";

export function HuntedItemTable() {
  const { session } = useStore(huntStore);
  return (
    <Table>
      <TableHead>
        <TableRow sx={{ whiteSpace: "noWrap" }}>
          <TableCell>Item</TableCell>
          <TableCell width={110}>Current#</TableCell>
          <TableCell width={110}>Goal#</TableCell>
          <TableCell width={250}>Target Monster(s)</TableCell>
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
  const { updateItem, removeItem, estimateHuntDuration } = useStore(huntStore);

  const { data: { entities: [item] = [] } = {}, isLoading: isItemLoading } =
    trpc.item.search.useQuery({
      filter: { Id: { value: hunt.itemId, matcher: "=" } },
    });

  const { data: { entities: allDrops = [] } = {}, isLoading } =
    trpc.drop.search.useQuery({
      filter: { ItemId: { value: hunt.itemId, matcher: "=" } },
      sort: [{ field: "Rate", sort: "desc" }],
    });

  const drops = uniqBy(allDrops, (d) => d.MonsterId);
  const canBeHunted = isLoading || !!drops.length;
  const selectedDrops = drops.filter((m) =>
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

  const huntDuration = estimateHuntDuration(selectedDrops);

  const canBeHuntedTableCells = [
    <TableCell key="current">
      <TextField
        type="number"
        value={hunt.current}
        onChange={(current) => updateItem({ ...hunt, current })}
      />
    </TableCell>,
    <TableCell key="goal">
      <TextField
        type="number"
        value={hunt.goal}
        onChange={(goal) => updateItem({ ...hunt, goal })}
      />
    </TableCell>,
    <TableCell key="targets">
      <Autocomplete<ItemDrop, true>
        size="small"
        sx={{ width: "100%" }}
        multiple
        limitTags={1}
        PopperComponent={MonsterSearchPopper}
        renderInput={(props) => (
          <MuiTextField
            {...props}
            label={selectedDrops.length ? undefined : "Select monster(s)"}
          />
        )}
        getOptionLabel={(drop) =>
          `${drop.MonsterName} (${dropChanceString(drop.Rate)})`
        }
        renderOption={(props, drop) => (
          <li {...props} key={drop.Id}>
            <MonsterIdentifier
              name={drop.MonsterName}
              id={drop.MonsterId}
              imageUrl={drop.MonsterImageUrl}
              sx={{ whiteSpace: "nowrap" }}
            >
              &nbsp;({dropChanceString(drop.Rate)})
            </MonsterIdentifier>
          </li>
        )}
        value={selectedDrops}
        options={drops}
        onChange={(props, drops) => {
          updateItem({ ...hunt, targets: drops.map((d) => d.MonsterId) });
        }}
      />
    </TableCell>,
    <TableCell key="duration">
      <Typography noWrap textAlign="center">
        {huntDuration === "unknown" ? (
          <InfoTooltip
            title={
              "Not enough data to estimate hunt duration. " +
              "Select your monster targets and specify a KPM."
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

const MonsterSearchPopper = function (props: any) {
  return <Popper {...props} style={{ minWidth: 300 }} />;
};
