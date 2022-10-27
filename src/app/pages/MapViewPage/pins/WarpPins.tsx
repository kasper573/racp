import { Fragment, memo } from "react";
import { Box, styled, useTheme } from "@mui/material";
import Xarrow, { Xwrapper } from "react-xarrows";
import { Point } from "../../../../lib/geometry";
import { Warp, WarpId } from "../../../../api/services/map/types";
import { MapPin } from "../MapPin";
import { routes } from "../../../router";
import { MapCoordinate } from "../MapCoordinate";
import { createHighlightSelector, HighlightId } from "../useHighlighter";
import { LinkOnMap, PinIcon, pinIconCss, PinLabel, PinsProps } from "./common";

export const WarpPins = memo(
  ({ entities, show, setHighlightId }: PinsProps<Warp, WarpId>) => {
    const theme = useTheme();
    return (
      <Xwrapper>
        {show &&
          entities.map((warp, index) => {
            const mouseBindings = {
              onMouseOver: () => setHighlightId?.(warp.id),
              onMouseOut: () => setHighlightId?.(undefined),
            };
            return (
              <Fragment key={`warp${index}`}>
                <MapPin
                  data-testid="Map pin"
                  x={warp.fromX}
                  y={warp.fromY}
                  highlightId={warp.id}
                  {...mouseBindings}
                  label={
                    <LinkOnMap
                      to={routes.map.view({
                        id: warp.toMap,
                        pin: { x: warp.toX, y: warp.toY },
                        tab: "warps",
                      })}
                    >
                      <PinLabel {...mouseBindings} color="white">
                        {warp.toMap}
                      </PinLabel>
                    </LinkOnMap>
                  }
                >
                  <PinIcon id={warpXArrowId(warp)} sx={pinIconCss} />
                </MapPin>
                {warp.toMap === warp.fromMap && (
                  <>
                    <ArrowHighlight highlightId={warp.id}>
                      <Xarrow
                        start={warpXArrowId(warp)}
                        end={pointXArrowId({ x: warp.toX, y: warp.toY })}
                        color={theme.palette.primary.main}
                      />
                    </ArrowHighlight>
                    <MapCoordinate
                      id={pointXArrowId({ x: warp.toX, y: warp.toY })}
                      x={warp.toX}
                      y={warp.toY}
                    />
                  </>
                )}
              </Fragment>
            );
          })}
      </Xwrapper>
    );
  }
);

const ArrowHighlight = styled(Box, {
  shouldForwardProp: (prop) => prop !== "highlightId",
})<{ highlightId: HighlightId }>`
  opacity: 0;
  ${(p) => createHighlightSelector(p.highlightId)} {
    opacity: 1;
  }
`;

const warpXArrowId = (warp: Warp) => `warp_arrow_${warp.id}`;

const pointXArrowId = (point: Point) => `point_arrow_${point.x}_${point.y}`;
