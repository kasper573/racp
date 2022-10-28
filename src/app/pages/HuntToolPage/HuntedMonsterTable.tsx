import {
  LinearProgress,
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
import { MonsterId } from "../../../api/services/monster/types";
import { HuntSession } from "./types";
import { HuntTableRow } from "./HuntTableRow";

export function HuntedMonsterTable({
  kpm: kpmMap,
  updateKPM,
}: {
  kpm: HuntSession["kpm"];
  updateKPM: (hunts: HuntSession["kpm"]) => void;
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Monster</TableCell>
          <TableCell width={150}>Kills per minute</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from(kpmMap.entries()).map(([monsterId, kpm]) => (
          <HuntedMonsterTableRow
            key={monsterId}
            monsterId={monsterId}
            kpm={kpm}
            updateKPM={(newKPM) => {
              updateKPM(
                produce(kpmMap, (draft) => {
                  draft.set(monsterId, newKPM);
                })
              );
            }}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function HuntedMonsterTableRow({
  monsterId,
  kpm,
  updateKPM,
}: {
  monsterId: MonsterId;
  kpm: number;
  updateKPM: (kpm: number) => void;
}) {
  const { data: { entities: [monster] = [] } = {}, isLoading } =
    trpc.monster.search.useQuery({
      filter: { Id: { value: monsterId, matcher: "=" } },
    });

  if (isLoading) {
    return (
      <HuntTableRow>
        <TableCell colSpan={2}>
          <LinearProgress />
        </TableCell>
      </HuntTableRow>
    );
  }

  return (
    <HuntTableRow>
      <TableCell>
        {monster && (
          <MonsterIdentifier
            name={monster.Name}
            id={monster.Id}
            imageUrl={monster.ImageUrl}
            sx={{ whiteSpace: "nowrap" }}
          />
        )}
      </TableCell>
      <TableCell>
        <TextField type="number" value={kpm} onChange={updateKPM} />
      </TableCell>
    </HuntTableRow>
  );
}
