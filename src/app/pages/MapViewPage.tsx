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
import { trpc } from "../state/client";
import { router } from "../router";
import { useRouteParams } from "../../lib/hooks/useRouteParams";
import { MapViewport } from "../components/MapViewport";
import { TabSwitch } from "../components/TabSwitch";
import { WarpGrid } from "../grids/WarpGrid";
import { MonsterSpawnGrid } from "../grids/MonsterSpawnGrid";
import { DataGridQueryFn } from "../components/DataGrid";
import { Warp, WarpFilter, WarpId } from "../../api/services/map/types";
import { MapPin } from "../components/MapPin";
import { Link } from "../components/Link";
import {
  MonsterSpawn,
  MonsterSpawnFilter,
  MonsterSpawnId,
} from "../../api/services/monster/types";
import { defined } from "../../lib/std/defined";
import { createSwarms } from "../../lib/createSwarms";
import { Area, center, distance, intersect, Point } from "../../lib/geometry";
import { LoadingPage } from "./LoadingPage";

export default function MapViewPage() {
  const history = useHistory();
  const [showWarpPins, setShowWarpPins] = useState(true);
  const [showMonsterPins, setShowMonsterPins] = useState(true);
  const [highlightSpawnId, setHighlightSpawnId] = useState<MonsterSpawnId>();
  const [highlightWarpId, setHighlightWarpId] = useState<WarpId>();
  const { id, x, y, tab = "warps" } = useRouteParams(router.map().view);
  const {
    data: map,
    isFetching,
    isLoading,
    error,
  } = trpc.map.getMap.useQuery(id);
  const routePoint = definedPoint({ x, y });

  const { data: { entities: warps = [] } = {} } = (
    trpc.map.searchWarps.useQuery as unknown as DataGridQueryFn<
      Warp,
      WarpFilter
    >
  )({ filter: { fromMap: { value: id, matcher: "equals" } }, limit: 50 });

  const { data: { entities: spawns = [] } = {} } = (
    trpc.monster.searchMonsterSpawns.useQuery as unknown as DataGridQueryFn<
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

  const spawnSwarms = useMemo(() => createMonsterSwarms(spawns), [spawns]);

  if (isLoading || isFetching) {
    return <LoadingPage />;
  }
  if (!map || error) {
    return <Header>Map not found</Header>;
  }

  const highlightedSwarm = spawnSwarms.find((swarm) =>
    swarm.all.some(
      (spawn) =>
        spawn.npcEntityId === highlightSpawnId || intersect(spawn, routePoint)
    )
  );

  const highlightedWarp = warps.find(
    (warp) =>
      warp.npcEntityId === highlightWarpId ||
      intersect(warpArea(warp), routePoint)
  );

  return (
    <>
      <Header back={router.map}>{map.displayName}</Header>
      <Stack spacing={2} direction="row" sx={{ flex: 1 }}>
        <Stack direction="column" sx={{ flex: 2 }}>
          <Stack direction="row" sx={{ height: 48 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showWarpPins}
                  onChange={(e) => setShowWarpPins(e.target.checked)}
                />
              }
              label="Show Warps"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showMonsterPins}
                  onChange={(e) => setShowMonsterPins(e.target.checked)}
                />
              }
              label="Show Monsters"
            />
          </Stack>
          <MapViewport imageUrl={map.imageUrl} bounds={map.bounds}>
            {showWarpPins &&
              warps.map((warp, index) => (
                <MapPin
                  data-testid="Map pin"
                  key={index}
                  x={warp.fromX}
                  y={warp.fromY}
                  highlight={warp === highlightedWarp}
                  label={
                    <LinkOnMap
                      to={router.map().view({
                        id: warp.toMap,
                        x: warp.toX,
                        y: warp.toY,
                        tab,
                      })}
                    >
                      <MapPinLabel color="white">{warp.toMap}</MapPinLabel>
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
                  highlight={swarm === highlightedSwarm}
                  label={
                    <>
                      {swarm.groups.map((group, index) => (
                        <LinkOnMap
                          key={index}
                          to={router.monster().view({ id: group.id })}
                          sx={{ lineHeight: "1em" }}
                        >
                          <MapPinLabel color={monsterColor}>
                            {group.name}{" "}
                            {group.size > 1 ? `x${group.size}` : ""}
                          </MapPinLabel>
                        </LinkOnMap>
                      ))}
                    </>
                  }
                >
                  <PestControlRodent
                    sx={{ ...mapPinIconCss, color: monsterColor }}
                  />
                </MapPin>
              ))}
          </MapViewport>
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
                      setHighlightWarpId(entity?.npcEntityId)
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
                      setHighlightSpawnId(entity?.npcEntityId)
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

const monsterColor = "#ff7878";

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
  font-size: ${(p) => p.theme.typography.caption.fontSize};
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
`;

function createMonsterSwarms(spawns: MonsterSpawn[], swarmDistance = 15) {
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
      all: swarm,
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

const warpArea = (warp: Warp): Area => ({
  x: warp.fromX,
  y: warp.fromY,
  width: warp.width,
  height: warp.height,
});

function definedPoint(point?: Partial<Point>) {
  return point?.x !== undefined && point?.y !== undefined
    ? { x: point.x, y: point.y }
    : undefined;
}
