import { DataGrid, DataGridQueryFn } from "../components/DataGrid";
import {
  createWarpId,
  Warp,
  WarpFilter,
  WarpId,
} from "../../api/services/map/types";
import { useSearchWarpsQuery } from "../state/client";
import { router } from "../router";

export const WarpGrid = DataGrid.define<Warp, WarpFilter, WarpId>({
  // Without assertion typescript yields possibly infinite error
  query: useSearchWarpsQuery as unknown as DataGridQueryFn<Warp, WarpFilter>,
  id: createWarpId,
  link: (id, warp) =>
    router.map().view({ id: warp.toMap, x: warp.toX, y: warp.toY }),
  columns: {
    toMap: "Destination",
    fromX: "X",
    fromY: "Y",
  },
});
