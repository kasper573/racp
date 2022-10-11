import { Stack } from "@mui/material";
import { useState } from "react";
import { useHistory } from "react-router";
import { Header } from "../../layout/Header";
import { trpc } from "../../state/client";
import { router } from "../../router";
import { useRouteParams } from "../../../lib/hooks/useRouteParams";
import { Point } from "../../../lib/geometry";
import { LoadingPage } from "../LoadingPage";
import { CommonPageGrid } from "../../components/CommonPageGrid";
import { WarpGrid } from "../../grids/WarpGrid";
import { MonsterSpawnGrid } from "../../grids/MonsterSpawnGrid";
import { TabSwitch } from "../../components/TabSwitch";
import { ShopGrid } from "../../grids/ShopGrid";
import { Select } from "../../controls/Select";
import { NpcGrid } from "../../grids/NpcGrid";
import { Warp, WarpId } from "../../../api/services/map/types";
import {
  MonsterSpawn,
  MonsterSpawnId,
} from "../../../api/services/monster/types";
import { Shop, ShopId } from "../../../api/services/shop/types";
import { Npc, NpcId } from "../../../api/services/npc/types";
import { MapRender, MapRenderPins } from "./MapRender";

const allPins = ["Warps", "Monsters", "Shops", "NPCs"] as const;
const defaultPins: PinName[] = ["Warps", "Monsters", "Shops"];
type PinName = typeof allPins[number];

export default function MapViewPage() {
  const history = useHistory();
  const [visiblePins, setVisiblePins] = useState<PinName[] | undefined>(
    Array.from(defaultPins)
  );
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

  const { data: { entities: npcs = [] } = {} } = trpc.npc.search.useQuery({
    filter: { mapId: { value: id, matcher: "equals" } },
  });

  const pins = {
    warps: useMapRenderPins<Warp, WarpId>(
      warps,
      visiblePins?.includes("Warps")
    ),
    shops: useMapRenderPins<Shop, ShopId>(
      shops,
      visiblePins?.includes("Shops")
    ),
    spawns: useMapRenderPins<MonsterSpawn, MonsterSpawnId>(
      spawns,
      visiblePins?.includes("Monsters")
    ),
    npcs: useMapRenderPins<Npc, NpcId>(npcs, visiblePins?.includes("NPCs")),
  };

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
              options={allPins}
              value={visiblePins}
              multi
              onChange={setVisiblePins}
            />
          </Stack>
          <MapRender
            map={map}
            tab={tab}
            routePoint={routePoint}
            routePointTitle={routePointTitle}
            {...pins}
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
                      pins.warps.setHighlightId(warp?.scriptId)
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
                      pins.spawns.setHighlightId(spawn?.scriptId)
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
                      pins.shops.setHighlightId(shop?.scriptId)
                    }
                  />
                ),
              },
              {
                id: "npcs",
                label: "NPCs",
                content: (
                  <NpcGrid
                    data={npcs}
                    onHoveredEntityChange={(npc) =>
                      pins.npcs.setHighlightId(npc?.scriptId)
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

function useMapRenderPins<T, Id>(
  entities: T[],
  show: boolean = false
): MapRenderPins<T, Id> {
  const [highlightId, setHighlightId] = useState<Id>();
  return { entities, show, highlightId, setHighlightId };
}

function definedPoint(point?: Partial<Point>) {
  return point?.x !== undefined && point?.y !== undefined
    ? { x: point.x, y: point.y }
    : undefined;
}
