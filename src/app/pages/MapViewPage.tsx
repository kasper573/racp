import {
  FormControlLabel,
  Stack,
  styled,
  Switch,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useHistory } from "react-router";
import { Directions, PestControlRodent } from "@mui/icons-material";
import { groupBy } from "lodash";
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
import { defined } from "../../lib/defined";
import { createSwarms } from "../../lib/createSwarms";
import { center, distance, intersect, Point } from "../../lib/geometry";
import { LoadingPage } from "./LoadingPage";

export default function MapViewPage() {
  const history = useHistory();
  const [showWarpPins, setShowWarpPins] = useState(true);
  const [showMonsterPins, setShowMonsterPins] = useState(true);
  const [hoverHighlight, setHoverHighlight] = useState<Point>();
  const { id, x, y, tab = "warps" } = useRouteParams(router.map().view);
  const { data: map, isLoading } = useGetMapQuery(id);
  const routeHighlight =
    x !== undefined && y !== undefined ? { x, y } : undefined;

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

  const spawnSwarms = useMemo(
    () => (pinnedSpawns ? createMonsterSwarms(pinnedSpawns.entities) : []),
    [pinnedSpawns]
  );

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!map) {
    return <Header>Map not found</Header>;
  }

  function isHighlighted(x = 0, y = 0, width = 0, height = 0) {
    const area = { x, y, width, height };
    return intersect(area, hoverHighlight) || intersect(area, routeHighlight);
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
                  highlight={isHighlighted(
                    warp.fromX,
                    warp.fromY,
                    warp.width,
                    warp.height
                  )}
                  label={
                    <LinkOnMap
                      to={router.map().view({
                        id: warp.toMap,
                        x: warp.toX,
                        y: warp.toY,
                        tab,
                      })}
                    >
                      <MapPinLabel>{warp.toMap}</MapPinLabel>
                    </LinkOnMap>
                  }
                >
                  <Directions sx={mapPinIconCss} />
                </MapPin>
              ))}
            {showMonsterPins &&
              spawnSwarms.map((swarm, index) => (
                <MapPin
                  key={index}
                  x={swarm.x}
                  y={swarm.y}
                  highlight={isHighlighted(swarm.x, swarm.y, 1, 1)}
                  label={
                    <>
                      {swarm.groups.map((group, index) => (
                        <LinkOnMap
                          key={index}
                          to={router.monster().view({ id: group.id })}
                          sx={{ lineHeight: "1em" }}
                        >
                          <MapPinLabel>
                            {group.name}{" "}
                            {group.size > 1 ? `x${group.size}` : ""}
                          </MapPinLabel>
                        </LinkOnMap>
                      ))}
                    </>
                  }
                >
                  <PestControlRodent sx={mapPinIconCss} />
                </MapPin>
              ))}
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
                        entity
                          ? { x: entity.fromX, y: entity.fromY }
                          : undefined
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
                          ? { x: entity.x, y: entity.y }
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

const mapPinIconCss = {
  color: "#fff",
  filter: `drop-shadow( 0 0 1px rgba(0, 0, 0, 1))`,
};

const LinkOnMap = styled(Link)`
  text-decoration: none;
  display: flex;
`;

const MapPinLabel = styled(Typography)`
  line-height: 1em;
  color: #fff;
  font-size: ${(p) => p.theme.typography.caption.fontSize};
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
`;

function createMonsterSwarms(spawns: MonsterSpawn[], swarmDistance = 30) {
  const spawnsWithLocations = defined(
    spawns.map(({ x, y, ...props }) =>
      x !== undefined && y !== undefined ? { ...props, x, y } : undefined
    )
  );
  const swarms = createSwarms(
    spawnsWithLocations,
    (a, b) => distance(a, b) <= swarmDistance
  );
  return swarms.map((swarm) => {
    return {
      ...center(swarm),
      groups: Object.values(groupBy(swarm, (spawn) => spawn.id)).map(
        (group) => ({
          name: group[0].name,
          id: group[0].id,
          size: group.length,
        })
      ),
    };
  });
}
