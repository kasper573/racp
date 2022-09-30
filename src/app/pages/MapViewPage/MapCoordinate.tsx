import { Box, styled } from "@mui/material";
import { ComponentProps, forwardRef, useContext } from "react";
import { MapContainerContext } from "./MapContainer";

export const MapCoordinate = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof MapCoordinateContainer> & { x: number; y: number }
>(({ x, y, style, children, ...props }, ref) => {
  const {
    bounds: { width, height },
  } = useContext(MapContainerContext);
  return (
    <MapCoordinateContainer
      style={{
        left: `${(x * 100) / width}%`,
        bottom: `${(y * 100) / height}%`,
        ...style,
      }}
      {...props}
    >
      <MapCoordinateAnchor>
        <MapCoordinateContent ref={ref}>{children}</MapCoordinateContent>
      </MapCoordinateAnchor>
    </MapCoordinateContainer>
  );
});

const MapCoordinateContainer = styled(Box)`
  position: absolute;
`;

const MapCoordinateAnchor = styled(Box)`
  position: relative;
`;

const MapCoordinateContent = styled(Box)`
  position: absolute;
  bottom: 0;
  transform: translateX(-50%);
  display: flex;
`;
