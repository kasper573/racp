import { Stack } from "@mui/material";
import { useState } from "react";
import { useHistory } from "react-router";
import { Header } from "../layout/Header";
import { useGetMapQuery, useSearchWarpsQuery } from "../state/client";
import { router } from "../router";
import { useRouteParams } from "../../lib/useRouteParams";
import { MapViewport } from "../components/MapViewport";
import { TabSwitch } from "../components/TabSwitch";
import { WarpGrid } from "../grids/WarpGrid";
import { MonsterSpawnGrid } from "../grids/MonsterSpawnGrid";
import { DataGridQueryFn } from "../components/DataGrid";
import { Warp, WarpFilter } from "../../api/services/map/types";
import { MapPin } from "../components/MapPin";
import { Link } from "../components/Link";
import { LoadingPage } from "./LoadingPage";

export default function MapViewPage() {
  const history = useHistory();
  const [hoverHighlight, setHoverHighlight] = useState<Point>();
  const { id, x, y, tab = "warps" } = useRouteParams(router.map().view);
  const { data: map, isLoading } = useGetMapQuery(id);
  const routeHighlight =
    x !== undefined && y !== undefined ? ([x, y] as Point) : undefined;

  const { data: warps } = (
    useSearchWarpsQuery as unknown as DataGridQueryFn<Warp, WarpFilter>
  )({ filter: { fromMap: { value: id, matcher: "equals" } }, limit: 50 });

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!map) {
    return <Header>Map not found</Header>;
  }

  const hoverWarp = warps?.entities.find((warp) =>
    isIntersection(warpArea(warp), hoverHighlight)
  );
  let routeWarp = warps?.entities.find((warp) =>
    isIntersection(warpArea(warp), routeHighlight)
  );
  if (hoverWarp) {
    routeWarp = undefined;
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
          {warps?.entities.map((warp, index) => {
            const area: Area = [warp.fromX, warp.fromY, warp.spanX, warp.spanY];
            return (
              <MapPin
                key={index}
                x={area[0]}
                y={area[1]}
                highlight={[routeWarp, hoverWarp].includes(warp)}
                wrap={(el) => (
                  <Link
                    to={router
                      .map()
                      .view({ id: warp.toMap, x: warp.toX, y: warp.toY, tab })}
                    sx={{ textDecoration: "none" }}
                  >
                    {el}
                  </Link>
                )}
              >
                {warp.toMap}
              </MapPin>
            );
          })}
        </MapViewport>
        <Stack direction="column" sx={{ flex: 1 }}>
          <TabSwitch
            activeTabId={tab}
            onChange={(e, newTab) =>
              history.replace(router.map().view({ id, tab: newTab, x, y }).$)
            }
            tabs={[
              {
                id: "warps",
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
                id: "monsters",
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

type Area = [number, number, number, number];
type Point = [number, number];

const warpArea = (warp: Warp): Area => [
  warp.fromX,
  warp.fromY,
  warp.spanX,
  warp.spanY,
];

function isIntersection([x, y, w, h]: Area, point?: Point, grace = 5): boolean {
  w += grace * 2;
  h += grace * 2;
  x -= w / 2;
  y -= h / 2;
  return (
    point !== undefined &&
    x <= point[0] &&
    x + w >= point[0] &&
    y <= point[1] &&
    y + h >= point[1]
  );
}
