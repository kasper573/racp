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
import { Link } from "../components/Link";

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
    map: {
      headerName: "Map",
      renderCell({ row: spawn }) {
        return (
          <Link
            to={router.map().view({ id: spawn.map, x: spawn.x, y: spawn.y })}
          >
            {monsterSpawnMapLabel(spawn)}
          </Link>
        );
      },
    },
    name: {
      headerName: "Name",
      width: 180,
      renderCell({ row: spawn }) {
        return (
          <Link to={router.monster().view({ id: spawn.id })}>{spawn.name}</Link>
        );
      },
    },
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

function monsterSpawnMapLabel(spawn: MonsterSpawn) {
  if (spawn.x !== undefined && spawn.y !== undefined) {
    return `${spawn.map} (${spawn.x},${spawn.y})`;
  }
  return spawn.map;
}

function renderTime({ value }: { value?: number }) {
  return value !== undefined ? durationString(value) : "-";
}
