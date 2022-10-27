import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { routes } from "../router";
import { Link } from "../components/Link";

export const WarpGrid = DataGrid.define(trpc.map.searchWarps.useQuery)({
  emptyComponent: () => <>No warps found</>,
  id: (warp) => warp.id,
  columns: {
    toMap: {
      headerName: "Destination",
      renderCell({ value, row: warp }) {
        return (
          <Link
            to={routes.map.view({
              id: warp.toMap,
              pin: { x: warp.toX, y: warp.toY },
            })}
          >
            {value} ({warp.toX}, {warp.toY})
          </Link>
        );
      },
    },
    fromX: "Warp X",
    fromY: "Warp Y",
  },
});
