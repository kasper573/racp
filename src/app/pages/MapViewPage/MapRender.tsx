import { styled, Tooltip, Typography, useTheme } from "@mui/material";
import {
  Directions,
  MonetizationOn,
  PestControlRodent,
  Place,
} from "@mui/icons-material";
import { useMemo } from "react";
import Xarrow, { Xwrapper } from "react-xarrows";
import { Link } from "../../components/Link";
import { Point } from "../../../lib/geometry";
import { MapInfo, Warp, WarpId } from "../../../api/services/map/types";
import {
  MonsterSpawn,
  MonsterSpawnId,
} from "../../../api/services/monster/types";
import { router } from "../../router";
import { Shop, ShopId } from "../../../api/services/shop/types";
import { Memo } from "../../../lib/Memo";
import { Npc, NpcId } from "../../../api/services/npc/types";
import { MapContainer } from "./MapContainer";
import { MapCoordinate } from "./MapCoordinate";
import { MapPin } from "./MapPin";
import { createMonsterSwarms } from "./createMonsterSwarms";

export interface MapRenderPins<T, Id> {
  entities: T[];
  show?: boolean;
  highlightId?: Id;
  setHighlightId: (id?: Id) => void;
}

export function MapRender({
  map,
  tab,
  warps,
  spawns,
  shops,
  routePoint,
  routePointTitle,
}: {
  map: MapInfo;
  tab?: string;
  warps: MapRenderPins<Warp, WarpId>;
  spawns: MapRenderPins<MonsterSpawn, MonsterSpawnId>;
  shops: MapRenderPins<Shop, ShopId>;
  npcs: MapRenderPins<Npc, NpcId>;
  routePoint?: Point;
  routePointTitle?: string;
}) {
  const theme = useTheme();

  const spawnSwarms = useMemo(
    () => createMonsterSwarms(spawns.entities),
    [spawns.entities]
  );

  const arrowWarp = warps.entities.find(
    (warp) => warp.toMap === map.id && warp.scriptId === warps.highlightId
  );

  return (
    <MapContainer imageUrl={map.imageUrl} bounds={map.bounds}>
      <Memo input={warps}>
        {({ entities, show, highlightId, setHighlightId }) =>
          show && (
            <Xwrapper>
              {arrowWarp && (
                <>
                  <Xarrow
                    start={warpXArrowId(arrowWarp)}
                    end={pointXArrowId({
                      x: arrowWarp.toX,
                      y: arrowWarp.toY,
                    })}
                    color={theme.palette.primary.main}
                  />
                  <MapCoordinate
                    id={pointXArrowId({ x: arrowWarp.toX, y: arrowWarp.toY })}
                    x={arrowWarp.toX}
                    y={arrowWarp.toY}
                  />
                </>
              )}
              {entities.map((warp, index) => {
                const mouseBindings = {
                  onMouseOver: () => setHighlightId?.(warp.scriptId),
                  onMouseOut: () => setHighlightId?.(undefined),
                };
                return (
                  <MapPin
                    data-testid="Map pin"
                    key={`warp${index}`}
                    x={warp.fromX}
                    y={warp.fromY}
                    highlight={warp.scriptId === highlightId}
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
          )
        }
      </Memo>
      <Memo input={{ ...spawns, swarms: spawnSwarms }}>
        {({ swarms, show, highlightId }) =>
          show &&
          swarms.map((swarm, index) => (
            <MapPin
              key={`monster-swarm${index}`}
              x={swarm.x}
              y={swarm.y}
              highlight={swarm.all.some(
                (spawn) => spawn.scriptId === highlightId
              )}
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
              <PestControlRodent
                sx={{ ...mapPinIconCss, color: monsterColor }}
              />
            </MapPin>
          ))
        }
      </Memo>
      <Memo input={shops}>
        {({ entities, show, highlightId, setHighlightId }) =>
          show &&
          entities.map((shop, index) => {
            if (shop.mapX !== undefined && shop.mapY !== undefined) {
              const mouseBindings = {
                onMouseOver: () => setHighlightId?.(shop.scriptId),
                onMouseOut: () => setHighlightId?.(undefined),
              };
              return (
                <MapPin
                  key={`shop${index}`}
                  x={shop.mapX}
                  y={shop.mapY}
                  highlight={shop.scriptId === highlightId}
                  {...mouseBindings}
                  label={
                    <LinkOnMap
                      to={router.shop({ id: shop.scriptId })}
                      sx={{ lineHeight: "1em" }}
                    >
                      <MapPinLabel {...mouseBindings} color={shopColor}>
                        {shop.name}
                      </MapPinLabel>
                    </LinkOnMap>
                  }
                >
                  <MonetizationOn sx={{ ...mapPinIconCss, color: shopColor }} />
                </MapPin>
              );
            }
            return null;
          })
        }
      </Memo>
      {routePoint && (
        <MapCoordinate x={routePoint.x} y={routePoint.y}>
          <Tooltip
            title={routePointTitle ?? "The warp you selected leads here"}
          >
            <Place sx={{ ...mapPinIconCss, fill: routePinColor }} />
          </Tooltip>
        </MapCoordinate>
      )}
    </MapContainer>
  );
}

const routePinColor = "#ff00ff";
const monsterColor = "#ff7878";
const shopColor = "#bbffbb";

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

const warpXArrowId = (warp: Warp) => `warp_arrow_${warp.scriptId}`;

const pointXArrowId = (point: Point) => `point_arrow_${point.x}_${point.y}`;
