import { Box, styled, Typography } from "@mui/material";
import { ComponentProps, createContext, useContext, useMemo } from "react";
import { useImage } from "../hooks/useImage";
import { cropSurroundingColors, RGB } from "../../lib/cropSurroundingColors";
import { MapBounds } from "../../api/services/map/types";

export interface MapViewportProps extends ComponentProps<typeof Viewport> {
  bounds?: MapBounds;
}

export function MapViewport({
  imageUrl,
  children,
  bounds,
  ...props
}: MapViewportProps) {
  const { image: originalImage, isBroken } = useImage(imageUrl);
  const image = useMemo(
    () =>
      originalImage
        ? cropSurroundingColors(originalImage, [magenta])
        : undefined,
    [originalImage]
  );
  return (
    <Box {...props}>
      <Viewport
        imageUrl={image?.src}
        style={{
          width: "100%",
          aspectRatio: image ? `${image.width} / ${image.height}` : undefined,
        }}
      >
        {!imageUrl && <Typography color="error">Map image missing</Typography>}
        {isBroken && (
          <Typography color="error">Map image could not be loaded</Typography>
        )}
        {bounds && image && (
          <MapViewportContext.Provider value={{ bounds }}>
            {children}
          </MapViewportContext.Provider>
        )}
      </Viewport>
      {!bounds && (
        <Typography color="error">
          Map bounds missing, cannot display pins
        </Typography>
      )}
    </Box>
  );
}

const Viewport = styled(Box)<{ imageUrl?: string }>`
  position: relative;
  background-image: ${({ imageUrl }) =>
    imageUrl ? `url(${imageUrl})` : undefined};
  background-repeat: no-repeat;
  background-size: 100% 100%;
`;

export function MapPin({
  x,
  y,
  children,
  ...props
}: ComponentProps<typeof PinContainer>) {
  const {
    bounds: { width, height },
  } = useContext(MapViewportContext);
  return (
    <PinContainer x={x / width} y={y / height} {...props}>
      <PinAnchor>
        <PinContent>{children}</PinContent>
      </PinAnchor>
    </PinContainer>
  );
}

const PinContainer = styled(Box)<{ x: number; y: number }>`
  position: absolute;
  left: ${({ x }) => x * 100}%;
  bottom: ${({ y }) => y * 100}%;
`;

const PinAnchor = styled(Box)`
  position: relative;
`;

const PinContent = styled(Box)`
  position: absolute;
  bottom: 0;
  transform: translateX(-50%);
  display: flex;
`;

const MapViewportContext = createContext<{ bounds: MapBounds }>({
  bounds: { width: 0, height: 0 },
});

const magenta: RGB = [255, 0, 255];
