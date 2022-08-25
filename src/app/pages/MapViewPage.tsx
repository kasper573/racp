import { FormControlLabel, Stack, styled, Switch } from "@mui/material";
import { useState } from "react";
import { useHistory } from "react-router";
import { Directions, PestControlRodent } from "@mui/icons-material";
import { Header } from "../layout/Header";
import {
  useGetMapQuery,
  useSearchMonsterSpawnsQuery,
  useSearchWarpsQuery,
} from "../state/client";
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
import {
  MonsterSpawn,
  MonsterSpawnFilter,
} from "../../api/services/monster/types";
import { LoadingPage } from "./LoadingPage";

export default function MapViewPage() {
  const history = useHistory();
  const [showWarpPins, setShowWarpPins] = useState(true);
  const [showMonsterPins, setShowMonsterPins] = useState(true);
  const [hoverHighlight, setHoverHighlight] = useState<Point>();
  const { id, x, y, tab = "warps" } = useRouteParams(router.map().view);
  const { data: map, isLoading } = useGetMapQuery(id);
  const routeHighlight =
    x !== undefined && y !== undefined ? ([x, y] as Point) : undefined;

  const { data: warps } = (
    useSearchWarpsQuery as unknown as DataGridQueryFn<Warp, WarpFilter>
  )({ filter: { fromMap: { value: id, matcher: "equals" } }, limit: 50 });

  const { data: pinnedSpawns } = (
    useSearchMonsterSpawnsQuery as unknown as DataGridQueryFn<
      MonsterSpawn,
      MonsterSpawnFilter
    >
  )({
    filter: {
      map: { value: id, matcher: "equals" },
      x: { value: 0, matcher: ">" },
      y: { value: 0, matcher: ">" },
    },
    limit: 50,
  });

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!map) {
    return <Header>Map not found</Header>;
  }

  function isHighlighted(x = 0, y = 0, w = 0, h = 0) {
    const area: Area = [x, y, w, h];
    return (
      isIntersection(area, hoverHighlight) ||
      isIntersection(area, routeHighlight)
    );
  }

  return (
    <>
      <Header back={router.map}>{map.displayName}</Header>
      <Stack spacing={2} direction="row" sx={{ flex: 1 }}>
        <Stack direction="column" sx={{ flex: 2 }}>
          <MapViewport
            sx={{ flex: 1 }}
            imageUrl={map.imageUrl}
            bounds={map.bounds}
          >
            {showWarpPins &&
              warps?.entities.map((warp, index) => (
                <MapPin
                  key={index}
                  x={warp.fromX}
                  y={warp.fromY}
                  width={warp.width}
                  height={warp.height}
                  highlight={isHighlighted(
                    warp.fromX,
                    warp.fromY,
                    warp.width,
                    warp.height
                  )}
                  label={warp.toMap}
                  wrap={(el) => (
                    <LinkOnMap
                      to={router.map().view({
                        id: warp.toMap,
                        x: warp.toX,
                        y: warp.toY,
                        tab,
                      })}
                    >
                      {el}
                    </LinkOnMap>
                  )}
                >
                  <Directions sx={{ color: "white" }} />
                </MapPin>
              ))}
            {showMonsterPins &&
              pinnedSpawns?.entities.map((spawn, index) => {
                return (
                  <MapPin
                    key={index}
                    x={spawn.x ?? 0}
                    y={spawn.y ?? 0}
                    width={spawn.width}
                    height={spawn.height}
                    highlight={isHighlighted(
                      spawn.x,
                      spawn.y,
                      spawn.width,
                      spawn.height
                    )}
                    label={spawn.name}
                    wrap={(el) => (
                      <LinkOnMap to={router.monster().view({ id: spawn.id })}>
                        {el}
                      </LinkOnMap>
                    )}
                  >
                    <PestControlRodent sx={{ color: "white" }} />
                  </MapPin>
                );
              })}
          </MapViewport>
          <Stack direction="column" sx={{ flex: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showWarpPins}
                  onChange={(e) => setShowWarpPins(e.target.checked)}
                />
              }
              label="Show Warp Pins"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showMonsterPins}
                  onChange={(e) => setShowMonsterPins(e.target.checked)}
                />
              }
              label="Show Monster Pins"
            />
          </Stack>
        </Stack>
        <Stack direction="column" sx={{ flex: 3 }}>
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
                    gridProps={{ columnVisibilityModel: { map: false } }}
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

const LinkOnMap = styled(Link)`
  text-decoration: none;
  display: flex;
`;

type Area = [number, number, number, number];
type Point = [number, number];

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
