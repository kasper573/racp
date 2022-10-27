import {
  IconButton,
  Popper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import produce from "immer";
import { Delete } from "@mui/icons-material";
import { ItemIdentifier } from "../../components/ItemIdentifier";
import { TextField } from "../../controls/TextField";
import { trpc } from "../../state/client";
import { ItemId } from "../../../api/services/item/types";
import { SearchField } from "../../components/SearchField";
import { ItemDrop } from "../../../api/services/drop/types";
import { MonsterIdentifier } from "../../components/MonsterIdentifier";
import { dropChanceString } from "../../grids/ItemDropGrid";
import { HuntedItem } from "./types";

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
          <TableCell width={90}>Current#</TableCell>
          <TableCell width={90}>Goal#</TableCell>
          <TableCell width={200}>Target Monster</TableCell>
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
  const useDropQuery = queryHookForItem(hunt.itemId);
  const { data: { entities: [item] = [] } = {} } = trpc.item.search.useQuery({
    filter: { Id: { value: hunt.itemId, matcher: "=" } },
  });
  const { data, isLoading } = useDropQuery("");
  const canBeHunted = isLoading || !!data?.length;

  return (
    <TableRow>
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
            <SearchField<ItemDrop>
              size="small"
              sx={{ width: "100%" }}
              onSelected={([drop]) => {
                if (drop) {
                  updateHunt({ ...hunt, target: drop.MonsterId });
                }
              }}
              useQuery={useDropQuery}
              optionKey={(drop) => drop.Id}
              optionLabel={(drop) => drop.MonsterName}
              renderOption={(drop) => (
                <MonsterIdentifier
                  name={drop.MonsterName}
                  id={drop.MonsterId}
                  imageUrl={drop.MonsterImageUrl}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  &nbsp;({dropChanceString(drop.Rate)})
                </MonsterIdentifier>
              )}
              startSearchingMessage="Select the monster to target for this item"
              noResultsText={(searchQuery) =>
                `No monsters matching "${searchQuery}" drops this item`
              }
              PopperComponent={MonsterSearchPopper}
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
    </TableRow>
  );
}

const MonsterSearchPopper = function (props: any) {
  return <Popper {...props} style={{ minWidth: 300 }} />;
};

function queryHookForItem(itemId: ItemId) {
  return function useDropSearchQuery(searchQuery: string) {
    const { data: { entities: drops = [] } = {}, isLoading } =
      trpc.drop.search.useQuery({
        filter: {
          ItemId: { value: itemId, matcher: "=" },
          MonsterName: searchQuery
            ? { value: searchQuery, matcher: "contains" }
            : undefined,
        },
        sort: [{ field: "Rate", sort: "desc" }],
      });
    return { data: drops, isLoading };
  };
}
