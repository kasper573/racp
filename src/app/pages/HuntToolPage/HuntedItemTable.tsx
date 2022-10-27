import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import produce from "immer";
import { ItemIdentifier } from "../../components/ItemIdentifier";
import { TextField } from "../../controls/TextField";
import { trpc } from "../../state/client";
import { ItemId } from "../../../api/services/item/types";
import { SearchField } from "../../components/SearchField";
import { ItemDrop } from "../../../api/services/drop/types";
import { MonsterIdentifier } from "../../components/MonsterIdentifier";
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
          <TableCell width={200}>Item</TableCell>
          <TableCell>Current#</TableCell>
          <TableCell>Goal#</TableCell>
          <TableCell width={200}>Target Monster</TableCell>
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
                    (h) => h.itemId === updatedHunt.itemId
                  );
                  draft[index] = updatedHunt;
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
  updateHunt: (hunt: HuntedItem) => void;
}) {
  const { data: { entities: [item] = [] } = {} } = trpc.item.search.useQuery({
    filter: { Id: { value: hunt.itemId, matcher: "=" } },
  });
  return (
    <TableRow>
      <TableCell>{item && <ItemIdentifier item={item} />}</TableCell>
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
          useQuery={queryHookForItem(hunt.itemId)}
          optionKey={(drop) => drop.Id}
          optionLabel={(drop) => drop.MonsterName}
          renderOption={(drop) => (
            <MonsterIdentifier
              name={drop.MonsterName}
              id={drop.MonsterId}
              imageUrl={drop.MonsterImageUrl}
            />
          )}
          startSearchingMessage="Select the monster to target for this item"
          noResultsText={(searchQuery) =>
            `No monsters matching "${searchQuery}" drops this item`
          }
        />
      </TableCell>
    </TableRow>
  );
}

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
      });
    return { data: drops, isLoading };
  };
}
