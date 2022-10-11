import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { router } from "../router";
import { Link } from "../components/Link";

export const WarpGrid = DataGrid.define(trpc.map.searchWarps.useQuery)({
  emptyComponent: () => <>No warps found</>,
  id: (warp) => warp.scriptId,
  columns: {
    toMap: {
      headerName: "Destination",
      renderCell({ value, row: warp }) {
        return (
          <Link
            to={router.map().view({ id: warp.toMap, x: warp.toX, y: warp.toY })}
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
