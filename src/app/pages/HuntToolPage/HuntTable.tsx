import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import produce from "immer";
import { Item, ItemId } from "../../../api/services/item/types";
import { ItemIdentifier } from "../../components/ItemIdentifier";
import { TextField } from "../../controls/TextField";
import { trpc } from "../../state/client";

export function HuntTable({
  hunts,
  updateHunts,
}: {
  hunts: Hunt[];
  updateHunts: (hunts: Hunt[]) => void;
}) {
  return (
    <Table>
      <TableHead>
        <TableCell>Item</TableCell>
        <TableCell>Current Amount</TableCell>
        <TableCell>Goal Amount</TableCell>
      </TableHead>
      <TableBody>
        {hunts.map((hunt) => (
          <HuntTableRow
            key={hunt.itemId}
            hunt={hunt}
            updateHunt={(updatedHunt) =>
              updateHunts(
                produce(hunts, (draft) => {
                  const index = draft.findIndex((h) => h.id === updatedHunt.id);
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

function HuntTableRow({
  hunt,
  updateHunt,
}: {
  hunt: Hunt;
  updateHunt: (hunt: Hunt) => void;
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
    </TableRow>
  );
}

export type Hunt = {
  id: number;
  itemId: ItemId;
  current: number;
  goal: number;
};

export function createHunt(item: Item): Hunt {
  return {
    id: item.Id,
    itemId: item.Id,
    current: 0,
    goal: 1,
  };
}
