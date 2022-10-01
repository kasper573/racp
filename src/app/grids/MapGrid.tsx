import { DataGrid } from "../components/DataGrid";
import { MapInfo, MapInfoFilter } from "../../api/services/map/types";
import { trpc } from "../state/client";
import { router } from "../router";

export const MapGrid = DataGrid.define<MapInfo, MapInfoFilter, MapInfo["id"]>({
  query: trpc.map.search.useQuery,
  link: (id) => router.map().view({ id }),
  id: (map) => map.id,
  columns: {
    displayName: { headerName: "Name", width: 350 },
    id: true,
  },
});
