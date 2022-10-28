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
} from "@mui/material";
import produce from "immer";
import { Delete } from "@mui/icons-material";
import { uniqBy } from "lodash";
import { ItemIdentifier } from "../../components/ItemIdentifier";
import { TextField } from "../../controls/TextField";
import { trpc } from "../../state/client";
import { MonsterIdentifier } from "../../components/MonsterIdentifier";
import { dropChanceString } from "../../grids/ItemDropGrid";
import { ItemDrop } from "../../../api/services/drop/types";
import { HuntedItem } from "./types";
import { HuntTableRow } from "./HuntTableRow";

export function HuntedItemTable({
  hunts,
  updateHunts,
}: {
  hunts: HuntedItem[];
  updateHunts: (hunts: HuntedItem[]) => void;
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Item</TableCell>
          <TableCell width={110}>Current#</TableCell>
          <TableCell width={110}>Goal#</TableCell>
          <TableCell width={250}>Target Monster</TableCell>
          <TableCell width={1} padding="checkbox"></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {hunts.map((hunt) => (
          <HuntedItemTableRow
            key={hunt.itemId}
            hunt={hunt}
            updateHunt={(updatedHunt) =>
              updateHunts(
                produce(hunts, (draft) => {
                  const index = draft.findIndex(
                    (h) => h.itemId === hunt.itemId
                  );
                  if (updatedHunt) {
                    draft[index] = updatedHunt;
                  } else {
                    draft.splice(index, 1);
                  }
                })
              )
            }
          />
        ))}
      </TableBody>
    </Table>
  );
}

function HuntedItemTableRow({
  hunt,
  updateHunt,
}: {
  hunt: HuntedItem;
  updateHunt: (hunt?: HuntedItem) => void;
}) {
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
  const targetedMonsters = drops.filter((m) =>
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

  return (
    <HuntTableRow>
      <TableCell>{item && <ItemIdentifier item={item} />}</TableCell>
      {!canBeHunted && (
        <TableCell colSpan={3}>
          Not dropped by any monster. Cannot be hunted.
        </TableCell>
      )}
      {canBeHunted && (
        <>
          <TableCell>
            <TextField
              type="number"
              value={hunt.current}
              onChange={(current) => updateHunt({ ...hunt, current })}
            />
          </TableCell>
          <TableCell>
            <TextField
              type="number"
              value={hunt.goal}
              onChange={(goal) => updateHunt({ ...hunt, goal })}
            />
          </TableCell>
          <TableCell>
            <Autocomplete<ItemDrop, true>
              size="small"
              sx={{ width: "100%" }}
              multiple
              limitTags={1}
              PopperComponent={MonsterSearchPopper}
              renderInput={(props) => (
                <MuiTextField
                  {...props}
                  label={
                    targetedMonsters.length ? undefined : "Select monster(s)"
                  }
                />
              )}
              getOptionLabel={(drop) => drop.MonsterName}
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
              value={targetedMonsters}
              options={drops}
              onChange={(props, drops) => {
                updateHunt({ ...hunt, targets: drops.map((d) => d.MonsterId) });
              }}
            />
          </TableCell>
        </>
      )}
      <TableCell padding="checkbox">
        <Tooltip title="Remove from hunt list">
          <IconButton onClick={() => updateHunt(undefined)}>
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
