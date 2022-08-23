import { ComponentProps, useContext, useState } from "react";
import { Popper, styled, Typography } from "@mui/material";
import { Place } from "@mui/icons-material";
import { MapCoordinate, MapViewportContext } from "./MapViewport";
import { LinkTo } from "./Link";

export interface MapPinProps
  extends Omit<ComponentProps<typeof MapCoordinate>, "onClick"> {
  linkTo?: LinkTo;
  onClick?: () => void;
  wrap?: (el: JSX.Element) => JSX.Element;
}

export function MapPin({
  children,
  linkTo,
  wrap = (v) => v,
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
            <MapPinLabel variant="caption" noWrap>
              {children}
            </MapPinLabel>
          )}
        </Popper>
      )}
      <MapCoordinate {...props}>
        {wrap(<MapPinIcon ref={setAnchorEl} />)}
      </MapCoordinate>
    </>
  );
}

const MapPinLabel = styled(Typography)`
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
    1px 1px 0 #000;
  color: #fff;
`;

const MapPinIcon = styled(Place)`
  filter: drop-shadow(0 0 2px #000);
  fill: #fff;
`;
