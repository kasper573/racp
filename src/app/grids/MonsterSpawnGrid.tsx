import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { router } from "../router";
import { Link } from "../components/Link";
import { IconWithLabel } from "../components/IconWithLabel";
import { monsterSpawnTimeColumns } from "./common";

export const MonsterSpawnGrid = DataGrid.define(
  trpc.monster.searchSpawns.useQuery
)({
  emptyComponent: () => <>No monster spawns found</>,
  id: (spawn) => spawn.id,
  columns: {
    name: {
      headerName: "Name",
      renderCell({ row: spawn }) {
        return (
          <IconWithLabel alt={spawn.name} src={spawn.imageUrl}>
            <Link to={router.monster.view({ id: spawn.monsterId })}>
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
          <Link to={router.map.view({ id: spawn.map, x: spawn.x, y: spawn.y })}>
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
    ...monsterSpawnTimeColumns,
  },
});
