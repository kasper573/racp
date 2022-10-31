/* eslint-disable react-hooks/rules-of-hooks */
import { useStore } from "zustand";
import { Box, Tooltip } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { TextField } from "../../../controls/TextField";
import { trpc } from "../../../state/client";
import { MonsterIdentifierByFilter } from "../../../components/MonsterIdentifier";
import { MonsterId } from "../../../../api/services/monster/types";
import { ColumnConventionProps, DataGrid } from "../../../components/DataGrid";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { InfoTooltip } from "../../../components/InfoTooltip";
import { LinkIconButton } from "../../../components/Link";
import { routes } from "../../../router";
import { huntStore } from "../huntStore";
import { RichHunt } from "../../../../api/services/hunt/types";
import { SpawnSelect } from "./SpawnSelect";

type HuntedMonster = RichHunt["monsters"][number];

export function HuntedMonsterGrid({
  monsters,
}: {
  monsters: RichHunt["monsters"];
}) {
  return (
    <DataGrid<HuntedMonster>
      id={(m) => m.monsterId}
      data={monsters}
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
      return (
        <MonsterIdentifierByFilter
          filter={{ Id: { value: hunt.monsterId, matcher: "=" } }}
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
    minWidth: 200,
    sortable: false,
    renderCell({ row: hunt }) {
      const { mutate: updateMonster } = trpc.hunt.updateMonster.useMutation();
      const { data: { entities: spawns = [] } = {}, isLoading } =
        trpc.monster.searchSpawns.useQuery({
          filter: { monsterId: { value: hunt.monsterId, matcher: "=" } },
          sort: [{ field: "amount", sort: "desc" }],
        });
      if (isLoading) {
        return <LoadingSpinner />;
      }
      if (!spawns.length) {
        return (
          <InfoTooltip title="No map spawns this monster">
            Cannot be hunted
          </InfoTooltip>
        );
      }
      const selectedSpawn = spawns.find((s) => s.id === hunt.spawnId);
      return (
        <>
          <SpawnSelect
            sx={{ minWidth: 150, width: 150 }}
            value={hunt.spawnId ?? undefined}
            options={spawns}
            onChange={(spawnId) => updateMonster({ ...hunt, spawnId })}
          />
          {selectedSpawn && (
            <Tooltip title="Go to map">
              <span>
                <LinkIconButton
                  to={routes.map.view({
                    id: selectedSpawn.map,
                    pin: { x: selectedSpawn.x, y: selectedSpawn.y },
                    tab: "monsters",
                  })}
                >
                  <OpenInNew />
                </LinkIconButton>
              </span>
            </Tooltip>
          )}
        </>
      );
    },
  },
  killsPerUnit: {
    renderHeader() {
      const { kpxUnit } = useStore(huntStore);
      return kpxUnit;
    },
    renderCell({ row: hunt }) {
      const { mutate: updateMonster } = trpc.hunt.updateMonster.useMutation();
      return (
        <TextField
          type="number"
          value={hunt.killsPerUnit}
          onChange={(kpu) => updateMonster({ ...hunt, killsPerUnit: kpu })}
        />
      );
    },
  },
};
