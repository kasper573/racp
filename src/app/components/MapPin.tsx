import { ComponentProps, ReactNode, useContext, useState } from "react";
import { Popper, styled, Theme, Typography } from "@mui/material";
import { MapCoordinate, MapViewportContext } from "./MapViewport";
import { LinkTo } from "./Link";

export interface MapPinProps
  extends Omit<ComponentProps<typeof MapCoordinate>, "onClick"> {
  width?: number;
  height?: number;
  linkTo?: LinkTo;
  onClick?: () => void;
  wrap?: (el: ReactNode) => ReactNode;
  highlight?: boolean;
  label?: ReactNode;
}

export function MapPin({
  children,
  linkTo,
  wrap = (v) => v,
  highlight = false,
  width,
  height,
  label,
  ...props
}: MapPinProps) {
  const { container } = useContext(MapViewportContext);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
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
              {label}
            </MapPinLabel>
          )}
        </Popper>
      )}
      <MapCoordinate ref={setAnchorEl} {...props}>
        {wrap(children)}
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
