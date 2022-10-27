import { Stack, Tooltip } from "@mui/material";
import { useState } from "react";
import { Place } from "@mui/icons-material";
import { Header } from "../../layout/Header";
import { trpc } from "../../state/client";
import { routes } from "../../router";
import { Point } from "../../../lib/geometry";
import { LoadingPage } from "../LoadingPage";
import { CommonPageGrid } from "../../components/CommonPageGrid";
import { WarpGrid } from "../../grids/WarpGrid";
import { MonsterSpawnGrid } from "../../grids/MonsterSpawnGrid";
import { TabSwitch } from "../../components/TabSwitch";
import { ShopGrid } from "../../grids/ShopGrid";
import { Select } from "../../controls/Select";
import { NpcGrid } from "../../grids/NpcGrid";

import { useHistory } from "../../../lib/tsr/react/useHistory";
import { RouteComponentProps } from "../../../lib/tsr/react/types";
import { useHighlighter } from "./useHighlighter";
import { WarpPins } from "./pins/WarpPins";
import { SpawnPins } from "./pins/SpawnPins";
import { ShopPins } from "./pins/ShopPins";
import { NpcPins } from "./pins/NpcPins";
import { MapCoordinate } from "./MapCoordinate";
import { pinIconCss } from "./pins/common";
import { MapContainer } from "./MapContainer";
import { MapTab, MapViewParams } from "./route";

const pinOptions = ["Warps", "Monsters", "Shops", "NPCs"] as const;
type PinName = typeof pinOptions[number];

export default function MapViewPage({
  params,
}: RouteComponentProps<MapViewParams>) {
  const { id, tab, pin: { x, y, title: routePointTitle } = {} } = params;
  const history = useHistory();
  const [visiblePins, setVisiblePins] = useState<PinName[] | undefined>(
    Array.from(pinOptions)
  );
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

  const setHighlightId = useHighlighter();

  const pins = {
    warps: {
      entities: warps,
      show: visiblePins?.includes("Warps"),
      setHighlightId,
    },
    shops: {
      entities: shops,
      show: visiblePins?.includes("Shops"),
      setHighlightId,
    },
    spawns: {
      entities: spawns,
      show: visiblePins?.includes("Monsters"),
      setHighlightId,
    },
    npcs: {
      entities: npcs,
      show: visiblePins?.includes("NPCs"),
      setHighlightId,
    },
  };

  if (isLoading || isFetching) {
    return <LoadingPage />;
  }
  if (!map || error) {
    return <Header title="Map not found" />;
  }

  return (
    <>
      <Header title={map.displayName} />
      <CommonPageGrid>
        <Stack direction="column" sx={{ flex: 2 }}>
          <Stack direction="column" sx={{ height: 48 }}>
            <Select
              sx={{ alignSelf: "flex-end" }}
              label="Pins"
              options={pinOptions}
              value={visiblePins}
              multi
              onChange={setVisiblePins}
            />
          </Stack>
          <MapContainer imageUrl={map.imageUrl} bounds={map.bounds}>
            <WarpPins {...pins.warps} />
            <SpawnPins {...pins.spawns} />
            <ShopPins {...pins.shops} />
            <NpcPins {...pins.npcs} />
            {routePoint && (
              <MapCoordinate x={routePoint.x} y={routePoint.y}>
                <Tooltip
                  title={routePointTitle ?? "The warp you selected leads here"}
                >
                  <Place sx={{ ...pinIconCss, fill: "#ff00ff" }} />
                </Tooltip>
              </MapCoordinate>
            )}
          </MapContainer>
        </Stack>
        <Stack direction="column" sx={{ flex: 3 }}>
          <TabSwitch<MapTab>
            activeTabId={tab}
            onChange={(e, tab) =>
              history.replace(routes.map.view({ ...params, tab }))
            }
            tabs={[
              {
                id: "warps",
                label: "Warps",
                content: (
                  <WarpGrid
                    data={warps}
                    onHoveredEntityChange={(warp) =>
                      pins.warps.setHighlightId(warp?.id)
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
                      pins.spawns.setHighlightId(spawn?.id)
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
                      pins.shops.setHighlightId(shop?.id)
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
                      pins.npcs.setHighlightId(npc?.id)
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
