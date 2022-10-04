import { styled, Tooltip, Typography, useTheme } from "@mui/material";
import { Directions, PestControlRodent, Place } from "@mui/icons-material";
import { Fragment, useMemo } from "react";
import Xarrow, { Xwrapper } from "react-xarrows";
import { Link } from "../../components/Link";
import { intersect, Point } from "../../../lib/geometry";
import { MapInfo, Warp, WarpId } from "../../../api/services/map/types";
import {
  MonsterSpawn,
  MonsterSpawnId,
} from "../../../api/services/monster/types";
import { router } from "../../router";
import { MapContainer } from "./MapContainer";
import { MapCoordinate } from "./MapCoordinate";
import { MapPin } from "./MapPin";
import { createMonsterSwarms } from "./createMonsterSwarms";

export function MapRender({
  map,
  tab,
  warps,
  spawns,
  highlightWarpId,
  highlightSpawnId,
  setHighlightWarpId,
  routePoint,
  routePointTitle,
  showWarpPins,
  showMonsterPins,
}: {
  map: MapInfo;
  tab?: string;
  warps: Warp[];
  spawns: MonsterSpawn[];
  highlightWarpId?: WarpId;
  setHighlightWarpId?: (id?: WarpId) => void;
  highlightSpawnId?: MonsterSpawnId;
  routePoint?: Point;
  routePointTitle?: string;
  showWarpPins?: boolean;
  showMonsterPins?: boolean;
}) {
  const theme = useTheme();

  const spawnSwarms = useMemo(() => createMonsterSwarms(spawns), [spawns]);
  const arrowWarp = warps.find(
    (warp) => warp.toMap === map.id && warp.npcEntityId === highlightWarpId
  );
  const highlightedSwarm = spawnSwarms.find((swarm) =>
    swarm.all.some(
      (spawn) =>
        spawn.npcEntityId === highlightSpawnId || intersect(spawn, routePoint)
    )
  );
  return (
    <MapContainer imageUrl={map.imageUrl} bounds={map.bounds}>
      {showWarpPins && (
        <Xwrapper>
          {arrowWarp && (
            <>
              <Xarrow
                start={warpXArrowId(arrowWarp)}
                end={pointXArrowId({ x: arrowWarp.toX, y: arrowWarp.toY })}
                color={theme.palette.primary.main}
              />
              <MapCoordinate
                id={pointXArrowId({ x: arrowWarp.toX, y: arrowWarp.toY })}
                x={arrowWarp.toX}
                y={arrowWarp.toY}
              />
            </>
          )}
          {warps.map((warp, index) => {
            const mouseBindings = {
              onMouseOver: () => setHighlightWarpId?.(warp.npcEntityId),
              onMouseOut: () => setHighlightWarpId?.(undefined),
            };
            return (
              <MapPin
                data-testid="Map pin"
                key={`warp${index}`}
                x={warp.fromX}
                y={warp.fromY}
                highlight={warp.npcEntityId === highlightWarpId}
                {...mouseBindings}
                label={
                  <LinkOnMap
                    to={router.map().view({
                      id: warp.toMap,
                      x: warp.toX,
                      y: warp.toY,
                      tab,
                    })}
                  >
                    <MapPinLabel {...mouseBindings} color="white">
                      {warp.toMap}
                    </MapPinLabel>
                  </LinkOnMap>
                }
              >
                <MapPinIcon id={warpXArrowId(warp)} sx={mapPinIconCss} />
              </MapPin>
            );
          })}
        </Xwrapper>
      )}
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
                      {group.name} {group.size > 1 ? `x${group.size}` : ""}
                    </MapPinLabel>
                  </LinkOnMap>
                ))}
              </>
            }
          >
            <PestControlRodent sx={{ ...mapPinIconCss, color: monsterColor }} />
          </MapPin>
        ))}
      {routePoint && (
        <MapCoordinate x={routePoint.x} y={routePoint.y}>
          <Tooltip
            title={routePointTitle ?? "The warp you selected leads here"}
          >
            <Place
              sx={{ ...mapPinIconCss, fill: theme.palette.success.main }}
            />
          </Tooltip>
        </MapCoordinate>
      )}
    </MapContainer>
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

const MapPinIcon = Directions;

const MapPinLabel = styled(Typography)`
  line-height: 1em;
  font-size: ${(p) => p.theme.typography.caption.fontSize};
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
`;

const warpXArrowId = (warp: Warp) => `warp_arrow_${warp.npcEntityId}`;

const pointXArrowId = (point: Point) => `point_arrow_${point.x}_${point.y}`;
