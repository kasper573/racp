import { Stack } from "@mui/material";
import { DataGrid } from "../components/DataGrid";
import {
  MonsterSpawn,
  MonsterSpawnFilter,
  MonsterSpawnId,
} from "../../api/services/monster/types";
import { trpc } from "../state/client";
import { router } from "../router";
import { durationString } from "../../lib/std/durationString";
import { Link } from "../components/Link";
import { ImageWithFallback } from "../components/ImageWithFallback";

export const MonsterSpawnGrid = DataGrid.define<
  MonsterSpawn,
  MonsterSpawnFilter,
  MonsterSpawnId
>({
  query: trpc.monster.searchSpawns.useQuery,
  id: (spawn) => spawn.npcEntityId,
  columns: {
    name: {
      headerName: "Name",
      width: 180,
      renderCell({ row: spawn }) {
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <ImageWithFallback
              src={spawn.imageUrl}
              alt={spawn.name}
              sx={{ width: 32 }}
            />
            <Link to={router.monster().view({ id: spawn.id })}>
              {spawn.name}
            </Link>
          </Stack>
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
