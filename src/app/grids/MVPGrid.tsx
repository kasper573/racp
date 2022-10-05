import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { MonsterIdentifier } from "../components/MonsterIdentifier";
import { Link } from "../components/Link";
import { router } from "../router";

export const MVPGrid = DataGrid.define(trpc.monster.searchMVPs.useQuery)({
  emptyComponent: () => <>No bosses found</>,
  id: (mvp) => mvp.id,
  columns: {
    name: {
      headerName: "Name",
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
    status: {
      headerName: "Status",
      renderCell({ row: mvp }) {
        return <>{JSON.stringify(mvp.status)}</>;
      },
    },
  },
});
