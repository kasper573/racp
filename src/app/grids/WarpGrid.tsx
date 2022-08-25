import { DataGrid, DataGridQueryFn } from "../components/DataGrid";
import {
  createWarpId,
  Warp,
  WarpFilter,
  WarpId,
} from "../../api/services/map/types";
import { useSearchWarpsQuery } from "../state/client";
import { router } from "../router";
import { Link } from "../components/Link";

export const WarpGrid = DataGrid.define<Warp, WarpFilter, WarpId>({
  // Without assertion typescript yields possibly infinite error
  query: useSearchWarpsQuery as unknown as DataGridQueryFn<Warp, WarpFilter>,
  id: createWarpId,
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
