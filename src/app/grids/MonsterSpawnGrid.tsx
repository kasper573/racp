import { DataGrid, DataGridQueryFn } from "../components/DataGrid";
import {
  createMonsterSpawnId,
  MonsterSpawn,
  MonsterSpawnFilter,
  MonsterSpawnId,
} from "../../api/services/monster/types";
import { useSearchMonsterSpawnsQuery } from "../state/client";
import { router } from "../router";
import { durationString } from "../../lib/durationString";

export const MonsterSpawnGrid = DataGrid.define<
  MonsterSpawn,
  MonsterSpawnFilter,
  MonsterSpawnId
>({
  // Without assertion typescript yields possibly infinite error
  query: useSearchMonsterSpawnsQuery as unknown as DataGridQueryFn<
    MonsterSpawn,
    MonsterSpawnFilter
  >,
  id: createMonsterSpawnId,
  link: (spawnId, { id }) => router.monster().view({ id }),
  columns: {
    name: "Name",
    amount: "Amount",
    spawnDelay: {
      headerName: "Spawn time",
      width: 120,
      renderCell: renderTime,
    },
    spawnWindow: {
      headerName: "Spawn window",
      width: 140,
      renderCell: renderTime,
    },
  },
});

function renderTime({ value }: { value?: number }) {
  return value !== undefined ? durationString(value) : "-";
}
