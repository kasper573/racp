import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { routes } from "../router";
import { Link } from "../components/Link";

export const ShopGrid = DataGrid.define(trpc.shop.search.useQuery)({
  emptyComponent: () => <>No shops found</>,
  id: (shop) => shop.id,
  columns: {
    name: {
      headerName: "Name",
      renderCell({ row: shop }) {
        return <Link to={routes.shop({ id: shop.id })}>{shop.name}</Link>;
      },
    },
    mapId: {
      headerName: "Map",
      renderCell({ row: shop }) {
        if (shop.mapId !== undefined) {
          return (
            <Link
              to={routes.map.view({
                id: shop.mapId,
                pin: { x: shop.mapX, y: shop.mapY },
              })}
            >
              {shop.mapId}
            </Link>
          );
        }
      },
    },
    mapX: {
      sortable: false,
      headerName: "Location",
      renderCell({ row: shop }) {
        if (shop.mapX !== undefined && shop.mapY !== undefined) {
          return `${shop.mapX},${shop.mapY}`;
        }
        return "Hidden";
      },
    },
  },
});
