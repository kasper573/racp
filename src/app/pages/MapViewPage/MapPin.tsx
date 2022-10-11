import { ComponentProps, ReactNode, useContext, useState } from "react";
import { Box, Popper, styled } from "@mui/material";
import { LinkTo } from "../../components/Link";
import { MapContainerContext } from "./MapContainer";
import { MapCoordinate } from "./MapCoordinate";
import { createHighlightSelector, HighlightId } from "./useHighlighter";

export interface MapPinProps
  extends Omit<ComponentProps<typeof MapCoordinate>, "onClick"> {
  linkTo?: LinkTo;
  onClick?: () => void;
  highlightId: HighlightId;
  label?: ReactNode;
}

export function MapPin({
  children,
  linkTo,
  highlightId,
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
          <Highlight highlightId={highlightId}>{label}</Highlight>
        </Popper>
      )}
      <MapCoordinate ref={setAnchorEl} {...props}>
        {children}
      </MapCoordinate>
    </>
  );
}

const Highlight = styled(Box, {
  shouldForwardProp: (prop) => prop !== "highlightId",
})<{ highlightId: HighlightId }>`
  padding: 2px 4px;
  border-radius: 4px;
  ${(p) => createHighlightSelector(p.highlightId)} {
    z-index: 1;
    background-color: ${(p) => p.theme.palette.primary.main};
  }
`;
