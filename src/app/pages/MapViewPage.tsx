import { Place } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { Header } from "../layout/Header";
import { useGetMapQuery } from "../state/client";
import { router } from "../router";
import { useRouteParams } from "../../lib/useRouteParams";
import { MapPin, MapViewport } from "../components/MapViewport";
import { LoadingPage } from "./LoadingPage";

export default function MapViewPage() {
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
      <MapViewport imageUrl={map.imageUrl} sx={{ width: "50%" }}>
        {x !== undefined && y !== undefined && (
          <MapPin x={x} y={y}>
            <Tooltip title={`Navigation: ${x}, ${y}`}>
              <Place />
            </Tooltip>
          </MapPin>
        )}
      </MapViewport>
    </>
  );
}
