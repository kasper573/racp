import { FormControlLabel, Stack, Switch } from "@mui/material";
import { useState } from "react";
import { Header } from "../../layout/Header";
import { trpc } from "../../state/client";
import { router } from "../../router";
import { useRouteParams } from "../../../lib/hooks/useRouteParams";
import { DataGridQueryFn } from "../../components/DataGrid";
import { Warp, WarpFilter, WarpId } from "../../../api/services/map/types";
import {
  MonsterSpawn,
  MonsterSpawnFilter,
  MonsterSpawnId,
} from "../../../api/services/monster/types";
import { Point } from "../../../lib/geometry";
import { LoadingPage } from "../LoadingPage";
import { MapRender } from "./MapRender";
import { MapTabs } from "./MapTabs";

export default function MapViewPage() {
  const [showWarpPins, setShowWarpPins] = useState(true);
  const [showMonsterPins, setShowMonsterPins] = useState(true);
  const [highlightSpawnId, setHighlightSpawnId] = useState<MonsterSpawnId>();
  const [highlightWarpId, setHighlightWarpId] = useState<WarpId>();
  const { id, x, y, tab } = useRouteParams(router.map().view);
  const {
    data: map,
    isFetching,
    isLoading,
    error,
  } = trpc.map.read.useQuery(id);
  const routePoint = definedPoint({ x, y });

  const { data: { entities: warps = [] } = {} } = (
    trpc.map.searchWarps.useQuery as unknown as DataGridQueryFn<
      Warp,
      WarpFilter
    >
  )({ filter: { fromMap: { value: id, matcher: "equals" } }, limit: 50 });

  const { data: { entities: spawns = [] } = {} } = (
    trpc.monster.searchSpawns.useQuery as unknown as DataGridQueryFn<
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

  if (isLoading || isFetching) {
    return <LoadingPage />;
  }
  if (!map || error) {
    return <Header>Map not found</Header>;
  }

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
          <MapRender
            map={map}
            tab={tab}
            warps={warps}
            spawns={spawns}
            routePoint={routePoint}
            highlightWarpId={highlightWarpId}
            highlightSpawnId={highlightSpawnId}
            setHighlightWarpId={setHighlightWarpId}
            showWarpPins={showWarpPins}
            showMonsterPins={showMonsterPins}
          />
        </Stack>
        <Stack direction="column" sx={{ flex: 3 }}>
          <MapTabs
            setHighlightWarpId={setHighlightWarpId}
            setHighlightSpawnId={setHighlightSpawnId}
          />
        </Stack>
      </Stack>
    </>
  );
}

function definedPoint(point?: Partial<Point>) {
  return point?.x !== undefined && point?.y !== undefined
    ? { x: point.x, y: point.y }
    : undefined;
}
