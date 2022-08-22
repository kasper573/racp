import { Stack, styled, Tooltip } from "@mui/material";
import { Place } from "@mui/icons-material";
import { useState } from "react";
import { Header } from "../layout/Header";
import { useGetMapQuery } from "../state/client";
import { router } from "../router";
import { useRouteParams } from "../../lib/useRouteParams";
import { MapPin, MapViewport } from "../components/MapViewport";
import { TabSwitch } from "../components/TabSwitch";
import { WarpGrid } from "../grids/WarpGrid";
import { MonsterSpawnGrid } from "../grids/MonsterSpawnGrid";
import { LoadingPage } from "./LoadingPage";

export default function MapViewPage() {
  const [pin, setPin] = useState<[number, number]>();
  const { id, x, y } = useRouteParams(router.map().view);
  const { data: map, isLoading } = useGetMapQuery(id);

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!map) {
    return <Header>Map not found</Header>;
  }

  return (
    <>
      <Header back={router.map}>{map.displayName}</Header>
      <Stack spacing={2} direction="row" sx={{ flex: 1 }}>
        <div>
          <MapViewport imageUrl={map.imageUrl} sx={{ width: "50%" }}>
            {x !== undefined && y !== undefined && (
              <MapPin x={x} y={y}>
                <Tooltip title={`Navigation: ${x}, ${y}`}>
                  <Place />
                </Tooltip>
              </MapPin>
            )}
            {pin !== undefined && (
              <MapPin x={pin[0]} y={pin[1]}>
                <PinWithShadow />
              </MapPin>
            )}
          </MapViewport>
        </div>
        <Stack direction="column" sx={{ flex: 1 }}>
          <TabSwitch
            tabs={[
              {
                label: "Warps",
                content: (
                  <WarpGrid
                    filter={{ fromMap: { value: id, matcher: "equals" } }}
                    onHoveredEntityChange={(entity) =>
                      setPin(entity ? [entity.fromX, entity.fromY] : undefined)
                    }
                  />
                ),
              },
              {
                label: "Monsters",
                content: (
                  <MonsterSpawnGrid
                    filter={{ map: { value: id, matcher: "equals" } }}
                    onHoveredEntityChange={(entity) =>
                      setPin(
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

const PinWithShadow = styled(Place)`
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.7));
`;
