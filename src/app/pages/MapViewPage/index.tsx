import { FormControlLabel, Stack, Switch } from "@mui/material";
import { useState } from "react";
import { useHistory } from "react-router";
import { Header } from "../../layout/Header";
import { trpc } from "../../state/client";
import { router } from "../../router";
import { useRouteParams } from "../../../lib/hooks/useRouteParams";
import { WarpId } from "../../../api/services/map/types";
import { MonsterSpawnId } from "../../../api/services/monster/types";
import { Point } from "../../../lib/geometry";
import { LoadingPage } from "../LoadingPage";
import { CommonPageGrid } from "../../components/CommonPageGrid";
import { WarpGrid } from "../../grids/WarpGrid";
import { MonsterSpawnGrid } from "../../grids/MonsterSpawnGrid";
import { TabSwitch } from "../../components/TabSwitch";
import { MapRender } from "./MapRender";

export default function MapViewPage() {
  const history = useHistory();
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

  const { data: { entities: warps = [] } = {} } = trpc.map.searchWarps.useQuery(
    { filter: { fromMap: { value: id, matcher: "equals" } } }
  );

  const { data: { entities: spawns = [] } = {} } =
    trpc.monster.searchSpawns.useQuery({
      filter: {
        map: { value: id, matcher: "equals" },
        x: { value: 0, matcher: ">" },
        y: { value: 0, matcher: ">" },
      },
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
      <CommonPageGrid>
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
          <TabSwitch
            activeTabId={tab ?? "warps"}
            onChange={(e, newTab) =>
              history.replace(router.map().view({ id, tab: newTab, x, y }).$)
            }
            tabs={[
              {
                id: "warps",
                label: "Warps",
                content: (
                  <WarpGrid
                    data={warps}
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
                    data={spawns}
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
      </CommonPageGrid>
    </>
  );
}

function definedPoint(point?: Partial<Point>) {
  return point?.x !== undefined && point?.y !== undefined
    ? { x: point.x, y: point.y }
    : undefined;
}
