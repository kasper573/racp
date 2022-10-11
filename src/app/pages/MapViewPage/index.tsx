import { Stack } from "@mui/material";
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
import { Select } from "../../controls/Select";
import { MapRender } from "./MapRender";

const defaultPins = ["Warps", "Monsters", "Shops"] as const;
type PinName = typeof defaultPins[number];

export default function MapViewPage() {
  const history = useHistory();
  const [pins, setPins] = useState<PinName[] | undefined>(
    Array.from(defaultPins)
  );
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
          <Stack direction="column" sx={{ height: 48 }}>
            <Select
              sx={{ alignSelf: "flex-end" }}
              label="Pins"
              options={defaultPins}
              value={pins}
              multi
              onChange={setPins}
            />
          </Stack>
          <MapRender
            map={map}
            tab={tab}
            warps={{
              entities: warps,
              show: pins?.includes("Warps"),
              highlightId: highlightWarpId,
              setHighlightId: setHighlightWarpId,
            }}
            spawns={{
              entities: spawns,
              show: pins?.includes("Monsters"),
              highlightId: highlightSpawnId,
              setHighlightId: setHighlightSpawnId,
            }}
            shops={{
              entities: shops,
              show: pins?.includes("Shops"),
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
                      setHighlightWarpId(warp?.scriptId)
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
                      setHighlightSpawnId(spawn?.scriptId)
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
                      setHighlightShopId(shop?.scriptId)
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
