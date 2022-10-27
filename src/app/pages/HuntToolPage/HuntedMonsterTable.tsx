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
        <TableRow>
          <TableCell>Monster</TableCell>
          <TableCell>Kills per minute</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {hunts.map((hunt) => (
          <HuntedMonsterTableRow
            key={hunt.monsterId}
            hunt={hunt}
            updateHunt={(updatedHunt) =>
              updateHunts(
                produce(hunts, (draft) => {
                  const index = draft.findIndex(
                    (h) => h.monsterId === updatedHunt.monsterId
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

function HuntedMonsterTableRow({
  hunt,
  updateHunt,
}: {
  hunt: HuntedMonster;
  updateHunt: (hunt: HuntedMonster) => void;
}) {
  const { data: { entities: [monster] = [] } = {} } =
    trpc.monster.search.useQuery({
      filter: { Id: { value: hunt.monsterId, matcher: "=" } },
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
