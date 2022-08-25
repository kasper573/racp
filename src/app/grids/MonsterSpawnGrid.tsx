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
  columns: {
    name: {
      headerName: "Name",
      width: 180,
      renderCell({ row: spawn }) {
        return (
          <Link to={router.monster().view({ id: spawn.id })}>{spawn.name}</Link>
        );
      },
    },
    map: {
      headerName: "Map",
      renderCell({ row: spawn }) {
        return (
          <Link
            to={router.map().view({ id: spawn.map, x: spawn.x, y: spawn.y })}
          >
            {spawn.map}
          </Link>
        );
      },
    },
    x: {
      sortable: false,
      headerName: "Location",
      renderCell({ row: spawn }) {
        if (spawn.x !== undefined && spawn.y !== undefined) {
          return `${spawn.x},${spawn.y}`;
        }
        return "Random";
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

function renderTime({ value }: { value?: number }) {
  return value !== undefined ? durationString(value) : "-";
}
