import { ComponentProps, ReactNode, useContext, useState } from "react";
import { Box, Popper, styled } from "@mui/material";
import { LinkTo } from "../../components/Link";
import { MapContainerContext } from "./MapContainer";
import { MapCoordinate } from "./MapCoordinate";

export interface MapPinProps
  extends Omit<ComponentProps<typeof MapCoordinate>, "onClick"> {
  linkTo?: LinkTo;
  onClick?: () => void;
  highlight?: boolean;
  label?: ReactNode;
}

export function MapPin({
  children,
  linkTo,
  highlight = false,
  label,
  ...props
}: MapPinProps) {
  const { container } = useContext(MapContainerContext);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  return (
    <>
      {anchorEl && (
        <Popper
          open
          sx={{ zIndex: highlight ? 1 : undefined }}
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
          <Highlight enabled={highlight}>{label}</Highlight>
        </Popper>
      )}
      <MapCoordinate ref={setAnchorEl} {...props}>
        {children}
      </MapCoordinate>
    </>
  );
}

const Highlight = styled(Box, {
  shouldForwardProp: (prop) => prop !== "enabled",
})<{ enabled: boolean }>`
  padding: 2px 4px;
  border-radius: 4px;
  background-color: ${(p) =>
    p.enabled ? p.theme.palette.primary.main : undefined};
  z-index: ${(p) => (p.enabled ? 1 : undefined)};
`;
