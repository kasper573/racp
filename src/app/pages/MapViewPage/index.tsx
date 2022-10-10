import { FormControlLabel, Stack, Switch, Typography } from "@mui/material";
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
import { ShopGrid } from "../../grids/ShopGrid";
import { ShopId } from "../../../api/services/shop/types";
import { MapRender } from "./MapRender";

export default function MapViewPage() {
  const history = useHistory();
  const [showWarpPins, setShowWarpPins] = useState(true);
  const [showMonsterPins, setShowMonsterPins] = useState(true);
  const [showShopPins, setShowShopPins] = useState(true);
  const [highlightSpawnId, setHighlightSpawnId] = useState<MonsterSpawnId>();
  const [highlightShopId, setHighlightShopId] = useState<ShopId>();
  const [highlightWarpId, setHighlightWarpId] = useState<WarpId>();
  const routeParams = useRouteParams(router.map().view);
  const { id, x, y, tab, title: routePointTitle } = routeParams;
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
      filter: { map: { value: id, matcher: "equals" } },
    });

  const { data: { entities: shops = [] } = {} } = trpc.shop.search.useQuery({
    filter: { mapId: { value: id, matcher: "equals" } },
  });

  const locatedSpawns = spawns.filter((spawn) => spawn.x && spawn.y);
  const locatedShops = shops.filter((shop) => shop.mapX && shop.mapY);

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
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ height: 48 }}
          >
            <Typography>Pins: </Typography>
            <Stack direction="row" sx={{ flex: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showWarpPins}
                    onChange={(e) => setShowWarpPins(e.target.checked)}
                  />
                }
                label="Warps"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showMonsterPins}
                    onChange={(e) => setShowMonsterPins(e.target.checked)}
                  />
                }
                label="Monsters"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showShopPins}
                    onChange={(e) => setShowShopPins(e.target.checked)}
                  />
                }
                label="Shops"
              />
            </Stack>
          </Stack>
          <MapRender
            map={map}
            tab={tab}
            warps={{
              entities: warps,
              show: showWarpPins,
              highlightId: highlightWarpId,
              setHighlightId: setHighlightWarpId,
            }}
            spawns={{
              entities: locatedSpawns,
              show: showMonsterPins,
              highlightId: highlightSpawnId,
              setHighlightId: setHighlightSpawnId,
            }}
            shops={{
              entities: locatedShops,
              show: showShopPins,
              highlightId: highlightShopId,
              setHighlightId: setHighlightShopId,
            }}
            routePoint={routePoint}
            routePointTitle={routePointTitle}
          />
        </Stack>
        <Stack direction="column" sx={{ flex: 3 }}>
          <TabSwitch
            activeTabId={tab ?? "warps"}
            onChange={(e, tab) =>
              history.replace(router.map().view({ ...routeParams, tab }).$)
            }
            tabs={[
              {
                id: "warps",
                label: "Warps",
                content: (
                  <WarpGrid
                    data={warps}
                    onHoveredEntityChange={(warp) =>
                      setHighlightWarpId(warp?.npcEntityId)
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
                    onHoveredEntityChange={(spawn) =>
                      setHighlightSpawnId(spawn?.npcEntityId)
                    }
                  />
                ),
              },
              {
                id: "shops",
                label: "Shops",
                content: (
                  <ShopGrid
                    data={shops}
                    gridProps={{ columnVisibilityModel: { mapId: false } }}
                    onHoveredEntityChange={(shop) =>
                      setHighlightShopId(shop?.npcEntityId)
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
