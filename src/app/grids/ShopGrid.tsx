import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { router } from "../router";
import { Link } from "../components/Link";

export const ShopGrid = DataGrid.define(trpc.shop.search.useQuery)({
  emptyComponent: () => <>No shops found</>,
  id: (shop) => shop.npcEntityId,
  columns: {
    name: {
      headerName: "Name",
      renderCell({ row: shop }) {
        return (
          <Link to={router.monster().view({ id: +shop.npcEntityId })}>
            {shop.name}
          </Link>
        );
      },
    },
    mapId: {
      headerName: "Map",
      renderCell({ row: shop }) {
        if (shop.mapId !== undefined) {
          return (
            <Link
              to={router
                .map()
                .view({ id: shop.mapId, x: shop.mapX, y: shop.mapY })}
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
