/* eslint-disable react-hooks/rules-of-hooks */
import { useStore } from "zustand";
import { Box } from "@mui/material";
import { TextField } from "../../controls/TextField";
import { trpc } from "../../state/client";
import { MonsterIdentifier } from "../../components/MonsterIdentifier";
import { MonsterId } from "../../../api/services/monster/types";
import { ColumnConventionProps, DataGrid } from "../../components/DataGrid";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { InfoTooltip } from "../../components/InfoTooltip";
import { HuntedMonster, huntStore } from "./huntStore";
import { SpawnSelect } from "./SpawnSelect";

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
    minWidth: 100,
    sortable: false,
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
  spawnId: {
    renderHeader() {
      return (
        <InfoTooltip
          title={
            "Selecting a map has no effect on estimates. " +
            "It exists just to aid you in keeping track of hunting locations"
          }
        >
          Map
        </InfoTooltip>
      );
    },
    minWidth: 175,
    sortable: false,
    renderCell({ row: hunt }) {
      const { updateMonster } = useStore(huntStore);
      const { data } = trpc.monster.searchSpawns.useQuery({
        filter: { monsterId: { value: hunt.monsterId, matcher: "=" } },
      });
      return (
        <SpawnSelect
          value={hunt.spawnId}
          options={data?.entities ?? []}
          onChange={(spawnId) => updateMonster({ ...hunt, spawnId })}
        />
      );
    },
  },
  kpm: {
    headerName: "Kills per minute",
    renderCell({ row: hunt }) {
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
