import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { routes } from "../router";

export const MapGrid = DataGrid.define(trpc.map.search.useQuery)({
  emptyComponent: () => <>No maps found</>,
  link: ({ id }) => routes.map.view({ id }),
  id: (map) => map.id,
  columns: {
    displayName: { headerName: "Name", width: 350 },
    id: true,
  },
});
