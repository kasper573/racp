import { Stack, Tooltip } from "@mui/material";
import { Place } from "@mui/icons-material";
import { Header } from "../layout/Header";
import { useGetMapQuery, useSearchWarpsQuery } from "../state/client";
import { router } from "../router";
import { useRouteParams } from "../../lib/useRouteParams";
import { MapPin, MapViewport } from "../components/MapViewport";
import { Link } from "../components/Link";
import { Warp, WarpFilter } from "../../api/services/npc/types";
import { SearchQuery } from "../../api/services/search/types";
import { LoadingPage } from "./LoadingPage";

export default function MapViewPage() {
  const { id, x, y } = useRouteParams(router.map().view);
  const { data: map, isLoading: isLoadingMap } = useGetMapQuery(id);
  const search: SearchQuery<Warp, WarpFilter> = {
    filter: {
      fromMap: {
        value: id,
        matcher: "equals",
        options: { caseSensitive: false },
      },
    },
    limit: 50,
  };
  const { data: warps, isLoading: isLoadingWarps } =
    useSearchWarpsQuery(search);

  const isLoading = isLoadingMap || isLoadingWarps;

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!map) {
    return <Header>Map not found</Header>;
  }

  return (
    <>
      <Header back={router.map}>{map.displayName}</Header>
      <Stack spacing={2} direction="row">
        <div>
          <MapViewport imageUrl={map.imageUrl} sx={{ width: "50%" }}>
            {x !== undefined && y !== undefined && (
              <MapPin x={x} y={y}>
                <Tooltip title={`Navigation: ${x}, ${y}`}>
                  <Place />
                </Tooltip>
              </MapPin>
            )}
          </MapViewport>
        </div>
        <div>
          {warps?.entities.map((warp: Warp, index: number) => (
            <li key={index}>
              <Link
                to={router
                  .map()
                  .view({ id: warp.toMap, x: warp.toX, y: warp.toY })}
              >
                {warpName(warp)}
              </Link>
            </li>
          ))}
        </div>
      </Stack>
    </>
  );
}

const warpName = (warp: Warp) => `To ${warp.toMap} (${warp.toX}, ${warp.toY})`;
