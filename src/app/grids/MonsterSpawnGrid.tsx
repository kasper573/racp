import { DataGrid, DataGridQueryFn } from "../components/DataGrid";
import {
  createMonsterSpawnId,
  MonsterSpawn,
  MonsterSpawnFilter,
  MonsterSpawnId,
} from "../../api/services/monster/types";
import { useSearchMonsterSpawnsQuery } from "../state/client";
import { router } from "../router";

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
    level: "Level",
    x: { headerName: "X", width: 50 },
    y: { headerName: "Y", width: 50 },
  },
});
