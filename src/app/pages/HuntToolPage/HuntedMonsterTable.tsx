import {
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useStore } from "zustand";
import { TextField } from "../../controls/TextField";
import { trpc } from "../../state/client";
import { MonsterIdentifier } from "../../components/MonsterIdentifier";
import { MonsterId } from "../../../api/services/monster/types";
import { HuntTableRow } from "./HuntTableRow";
import { huntStore } from "./huntStore";

export function HuntedMonsterTable() {
  const { session, updateMonster } = useStore(huntStore);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Monster</TableCell>
          <TableCell width={150}>Kills per minute</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {session.monsters.map(({ monsterId, kpm }) => (
          <HuntedMonsterTableRow
            key={monsterId}
            monsterId={monsterId}
            kpm={kpm}
            setKPM={(kpm) => updateMonster({ monsterId, kpm })}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function HuntedMonsterTableRow({
  monsterId,
  kpm,
  setKPM,
}: {
  monsterId: MonsterId;
  kpm: number;
  setKPM: (kpm: number) => void;
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
        <TextField type="number" value={kpm} onChange={setKPM} />
      </TableCell>
    </HuntTableRow>
  );
}
