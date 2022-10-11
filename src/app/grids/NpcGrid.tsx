import { DataGrid } from "../components/DataGrid";
import { trpc } from "../state/client";
import { router } from "../router";
import { Link } from "../components/Link";

export const NpcGrid = DataGrid.define(trpc.npc.search.useQuery)({
  emptyComponent: () => <>No npcs found</>,
  id: (npc) => npc.scriptId,
  columns: {
    name: {
      headerName: "Name",
      renderCell({ row: npc }) {
        return (
          <Link
            to={router
              .map()
              .view({
                id: npc.mapId,
                x: npc.mapX,
                y: npc.mapY,
                tab: "npcs",
                title: npc.name,
              })}
          >
            {npc.name}
          </Link>
        );
      },
    },
    mapX: {
      sortable: false,
      headerName: "Location",
      renderCell({ row: npc }) {
        return `${npc.mapX},${npc.mapY}`;
      },
    },
  },
});
