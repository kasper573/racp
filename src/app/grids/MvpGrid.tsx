import { capitalize } from "lodash";
import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { MonsterIdentifier } from "../components/MonsterIdentifier";
import { Link } from "../components/Link";
import { router } from "../router";
import { durationString } from "../../lib/std/durationString";
import { monsterSpawnTimeColumns } from "./common";

export const MvpGrid = DataGrid.define(trpc.monster.searchMvps.useQuery)({
  emptyComponent: () => <>No bosses found</>,
  id: (mvp) => mvp.id,
  columns: {
    name: {
      headerName: "Monster",
      renderCell({ row: mvp }) {
        return (
          <MonsterIdentifier
            name={mvp.name}
            imageUrl={mvp.imageUrl}
            id={mvp.monsterId}
          />
        );
      },
    },
    mapName: {
      headerName: "Map",
      renderCell({ row: mvp }) {
        return (
          <Link to={router.map().view({ id: mvp.mapId })}>{mvp.mapName}</Link>
        );
      },
    },
    ...monsterSpawnTimeColumns,
    killedAt: {
      headerName: "Death time",
      renderCell({ row: mvp }) {
        return mvp.killedAt !== undefined
          ? durationString(Date.now() - mvp.killedAt, 2) + " ago"
          : undefined;
      },
    },
    killedBy: "MVP",
    lifeStatus: {
      headerName: "Status",
      renderCell({ row }) {
        return capitalize(row.lifeStatus);
      },
    },
  },
});
