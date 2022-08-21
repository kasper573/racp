import { Stack, Tooltip } from "@mui/material";
import { Place } from "@mui/icons-material";
import { Header } from "../layout/Header";
import { useGetMapQuery, useSearchWarpsQuery } from "../state/client";
import { router } from "../router";
import { useRouteParams } from "../../lib/useRouteParams";
import { MapPin, MapViewport } from "../components/MapViewport";
import {
  createWarpId,
  Warp,
  WarpFilter,
  WarpId,
} from "../../api/services/npc/types";
import { DataGrid, DataGridQueryFn } from "../components/DataGrid";
import { TabSwitch } from "../components/TabSwitch";
import { LoadingPage } from "./LoadingPage";

export default function MapViewPage() {
  const { id, x, y } = useRouteParams(router.map().view);
  const { data: map, isLoading } = useGetMapQuery(id);

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!map) {
    return <Header>Map not found</Header>;
  }

  return (
    <>
      <Header back={router.map}>{map.displayName}</Header>
      <Stack spacing={2} direction="row" sx={{ flex: 1 }}>
        <div>
          <MapViewport imageUrl={map.imageUrl} sx={{ width: "50%" }}>
            {x !== undefined && y !== undefined && (
              <MapPin x={x} y={y}>
                <Tooltip title={`Navigation: ${x}, ${y}`}>
                  <Place />
                </Tooltip>
              </MapPin>
            )}
          </MapViewport>
        </div>
        <Stack direction="column" sx={{ flex: 1 }}>
          <TabSwitch
            tabs={[
              {
                label: "Warps",
                content: (
                  <WarpGrid
                    filter={{ fromMap: { value: id, matcher: "equals" } }}
                  />
                ),
              },
              { label: "Monsters", content: <>TODO</> },
              { label: "Shops", content: <>TODO</> },
              { label: "NPCs", content: <>TODO</> },
            ]}
          />
        </Stack>
      </Stack>
    </>
  );
}

const warpName = (warp: Warp) => `To ${warp.toMap} (${warp.toX}, ${warp.toY})`;

const WarpGrid = DataGrid.define<Warp, WarpFilter, WarpId>({
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
