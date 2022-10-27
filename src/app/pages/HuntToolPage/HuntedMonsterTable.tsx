import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import produce from "immer";
import { TextField } from "../../controls/TextField";
import { trpc } from "../../state/client";
import { MonsterIdentifier } from "../../components/MonsterIdentifier";
import { HuntedMonster } from "./types";

export function HuntedMonsterTable({
  hunts,
  updateHunts,
}: {
  hunts: HuntedMonster[];
  updateHunts: (hunts: HuntedMonster[]) => void;
}) {
  return (
    <Table>
      <TableHead>
        <TableCell>Monster</TableCell>
        <TableCell>Kills per minute</TableCell>
      </TableHead>
      <TableBody>
        {hunts.map((hunt) => (
          <HuntedMonsterTableRow
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

function HuntedMonsterTableRow({
  hunt,
  updateHunt,
}: {
  hunt: HuntedMonster;
  updateHunt: (hunt: HuntedMonster) => void;
}) {
  const { data: { entities: [monster] = [] } = {} } =
    trpc.monster.search.useQuery({
      filter: { Id: { value: hunt.id, matcher: "=" } },
    });
  return (
    <TableRow>
      <TableCell>
        {monster && (
          <MonsterIdentifier
            name={monster.Name}
            id={monster.Id}
            imageUrl={monster.ImageUrl}
          />
        )}
      </TableCell>
      <TableCell>
        <TextField
          type="number"
          value={hunt.killsPerMinute}
          onChange={(killsPerMinute) => updateHunt({ ...hunt, killsPerMinute })}
        />
      </TableCell>
    </TableRow>
  );
}
