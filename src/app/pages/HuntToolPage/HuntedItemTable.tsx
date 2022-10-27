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
        <TableCell>Item</TableCell>
        <TableCell>Current#</TableCell>
        <TableCell>Goal#</TableCell>
        <TableCell>Target</TableCell>
      </TableHead>
      <TableBody>
        {hunts.map((hunt) => (
          <HuntedItemTableRow
            key={hunt.id}
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

function HuntedItemTableRow({
  hunt,
  updateHunt,
}: {
  hunt: HuntedItem;
  updateHunt: (hunt: HuntedItem) => void;
}) {
  const { data: { entities: [item] = [] } = {} } = trpc.item.search.useQuery({
    filter: { Id: { value: hunt.id, matcher: "=" } },
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
        <TextField
          type="number"
          value={hunt.goal}
          onChange={(goal) => updateHunt({ ...hunt, goal })}
        />
      </TableCell>
    </TableRow>
  );
}
