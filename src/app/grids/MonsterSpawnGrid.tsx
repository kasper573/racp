import { DataGrid } from "../components/DataGrid";

import { trpc } from "../state/client";
import { router } from "../router";
import { durationString } from "../../lib/std/durationString";
import { Link } from "../components/Link";
import { IconWithLabel } from "../components/IconWithLabel";

export const MonsterSpawnGrid = DataGrid.define(
  trpc.monster.searchSpawns.useQuery
)({
  emptyComponent: () => <>No monster spawns found</>,
  id: (spawn) => spawn.npcEntityId,
  columns: {
    name: {
      headerName: "Name",
      renderCell({ row: spawn }) {
        return (
          <IconWithLabel alt={spawn.name} src={spawn.imageUrl}>
            <Link to={router.monster().view({ id: spawn.id })}>
              {spawn.name}
            </Link>
          </IconWithLabel>
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
      renderCell: renderTime,
    },
    spawnWindow: {
      headerName: "Spawn window",
      renderCell: renderTime,
    },
  },
});

function renderTime({ value }: { value?: number }) {
  return value !== undefined ? durationString(value, 2) : "-";
}
