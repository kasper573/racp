import { Stack, styled, Typography } from "@mui/material";
import { Place } from "@mui/icons-material";
import { useState } from "react";
import { Header } from "../layout/Header";
import { useGetMapQuery, useSearchWarpsQuery } from "../state/client";
import { router } from "../router";
import { useRouteParams } from "../../lib/useRouteParams";
import { MapPin, MapViewport } from "../components/MapViewport";
import { TabSwitch } from "../components/TabSwitch";
import { WarpGrid } from "../grids/WarpGrid";
import { MonsterSpawnGrid } from "../grids/MonsterSpawnGrid";
import { DataGridQueryFn } from "../components/DataGrid";
import { Warp, WarpFilter } from "../../api/services/map/types";
import { LoadingPage } from "./LoadingPage";

export default function MapViewPage() {
  const [hoverHighlight, setHoverHighlight] = useState<[number, number]>();
  const { id, x, y } = useRouteParams(router.map().view);
  const { data: map, isLoading } = useGetMapQuery(id);
  const routeHighlight =
    x !== undefined && y !== undefined ? ([x, y] as const) : undefined;

  const { data: warps } = (
    useSearchWarpsQuery as unknown as DataGridQueryFn<Warp, WarpFilter>
  )({ filter: { fromMap: { value: id, matcher: "equals" } }, limit: 100 });

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
        <MapViewport
          sx={{ flex: 1 }}
          imageUrl={map.imageUrl}
          bounds={map.bounds}
        >
          {warps?.entities.map((warp, index) => (
            <MapPin key={index} x={warp.fromX} y={warp.fromY}>
              <Stack direction="column" alignItems="center">
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    position: "absolute",
                    left: 24,
                    textShadow: "0 0 0.5rem #000",
                  }}
                >
                  {warp.toMap} ({warp.fromX}, {warp.fromY})
                </Typography>
                <PinWithShadow />
              </Stack>
            </MapPin>
          ))}
        </MapViewport>
        <Stack direction="column" sx={{ flex: 1 }}>
          <TabSwitch
            tabs={[
              {
                label: "Warps",
                content: (
                  <WarpGrid
                    filter={{ fromMap: { value: id, matcher: "equals" } }}
                    onHoveredEntityChange={(entity) =>
                      setHoverHighlight(
                        entity ? [entity.fromX, entity.fromY] : undefined
                      )
                    }
                  />
                ),
              },
              {
                label: "Monsters",
                content: (
                  <MonsterSpawnGrid
                    filter={{ map: { value: id, matcher: "equals" } }}
                    onHoveredEntityChange={(entity) =>
                      setHoverHighlight(
                        entity?.x !== undefined && entity?.y !== undefined
                          ? [entity.x, entity.y]
                          : undefined
                      )
                    }
                  />
                ),
              },
            ]}
          />
        </Stack>
      </Stack>
    </>
  );
}

const PinWithShadow = styled(Place)`
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.7));
`;
