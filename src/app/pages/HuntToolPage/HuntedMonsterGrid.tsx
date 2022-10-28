import { useStore } from "zustand";
import { Box } from "@mui/material";
import { TextField } from "../../controls/TextField";
import { trpc } from "../../state/client";
import { MonsterIdentifier } from "../../components/MonsterIdentifier";
import { MonsterId } from "../../../api/services/monster/types";
import { ColumnConventionProps, DataGrid } from "../../components/DataGrid";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { HuntedMonster, huntStore } from "./huntStore";

export function HuntedMonsterGrid() {
  const { session } = useStore(huntStore);

  return (
    <DataGrid<HuntedMonster>
      id={(m) => m.monsterId}
      data={session.monsters}
      emptyComponent={Empty}
      columns={columns}
    />
  );
}

const Empty = () => (
  <Box sx={{ textAlign: "center" }}>
    This list will be populated automatically when you select target monsters in
    the item list.
  </Box>
);

const columns: ColumnConventionProps<HuntedMonster, MonsterId>["columns"] = {
  monsterId: {
    headerName: "Monster",
    renderCell({ row: hunt }) {
      const { data: { entities: [monster] = [] } = {}, isLoading } =
        trpc.monster.search.useQuery({
          filter: { Id: { value: hunt.monsterId, matcher: "=" } },
        });
      if (isLoading) {
        return <LoadingSpinner />;
      }
      return (
        <MonsterIdentifier
          name={monster.Name}
          id={monster.Id}
          imageUrl={monster.ImageUrl}
          sx={{ whiteSpace: "nowrap" }}
        />
      );
    },
  },
  kpm: {
    headerName: "Kills per minute",
    renderCell({ row: hunt }) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { updateMonster } = useStore(huntStore);
      return (
        <TextField
          type="number"
          value={hunt.kpm}
          onChange={(kpm) => updateMonster({ ...hunt, kpm })}
        />
      );
    },
  },
};
