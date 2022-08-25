import { ComponentProps, useContext, useState } from "react";
import { Popper, styled, Theme, Typography } from "@mui/material";
import { Place } from "@mui/icons-material";
import { MapCoordinate, MapViewportContext } from "./MapViewport";
import { LinkTo } from "./Link";

export interface MapPinProps
  extends Omit<ComponentProps<typeof MapCoordinate>, "onClick"> {
  linkTo?: LinkTo;
  onClick?: () => void;
  wrap?: (el: JSX.Element) => JSX.Element;
  highlight?: boolean;
}

export function MapPin({
  children,
  linkTo,
  wrap = (v) => v,
  highlight = false,
  ...props
}: MapPinProps) {
  const { container } = useContext(MapViewportContext);
  const [anchorEl, setAnchorEl] = useState<SVGSVGElement | null>(null);
  return (
    <>
      {anchorEl && (
        <Popper
          open
          placement="right"
          disablePortal={false}
          anchorEl={anchorEl}
          modifiers={[
            {
              name: "flip",
              enabled: true,
              options: {
                boundary: container,
              },
            },
          ]}
        >
          {wrap(
            <MapPinLabel variant="caption" noWrap highlight={highlight}>
              {children}
            </MapPinLabel>
          )}
        </Popper>
      )}
      <MapCoordinate {...props}>
        {wrap(<MapPinIcon ref={setAnchorEl} highlight={highlight} />)}
      </MapCoordinate>
    </>
  );
}

const color = (p: { highlight?: boolean; theme: Theme }) =>
  p.highlight ? p.theme.palette.primary.main : "#fff";

const MapPinLabel = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "highlight",
})<{ highlight: boolean }>`
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
    1px 1px 0 #000;
  color: ${color};
`;

const MapPinIcon = styled(Place, {
  shouldForwardProp: (prop) => prop !== "highlight",
})<{ highlight: boolean }>`
  filter: drop-shadow(0 0 2px #000);
  fill: ${color};
`;
