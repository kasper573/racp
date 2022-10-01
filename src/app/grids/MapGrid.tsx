import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { router } from "../router";
import { MapId } from "../../api/services/map/types";

export const MapGrid = DataGrid.define(trpc.map.search.useQuery)({
  link: (id: MapId) => router.map().view({ id }),
  id: (map) => map.id,
  columns: {
    displayName: { headerName: "Name", width: 350 },
    id: true,
  },
});
