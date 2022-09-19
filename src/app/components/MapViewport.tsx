import { Box, styled, Typography } from "@mui/material";
import {
  ComponentProps,
  createContext,
  forwardRef,
  useContext,
  useState,
} from "react";
import { useImage } from "../../lib/hooks/useImage";
import { MapBounds } from "../../api/services/map/types";
import { LoadingSpinner } from "./LoadingSpinner";

export interface MapViewportProps extends ComponentProps<typeof Viewport> {
  bounds?: MapBounds;
}

export function MapViewport({
  imageUrl,
  children,
  bounds: mapBounds,
  style,
  ...props
}: MapViewportProps) {
  const [container, setContainer] = useState<HTMLElement>();
  const image = useImage(imageUrl);
  return (
    <>
      <Viewport
        data-testid="Map viewport"
        ref={setContainer}
        imageUrl={image.dataUrl}
        style={{
          width: "100%",
          aspectRatio: image.bounds
            ? `${image.bounds.width} / ${image.bounds.height}`
            : undefined,
          ...style,
        }}
        {...props}
      >
        {!imageUrl && <Typography color="error">Map image missing</Typography>}
        {image.isBroken && (
          <Typography color="error">Map image could not be loaded</Typography>
        )}
        {mapBounds && image.bounds && (
          <MapViewportContext.Provider value={{ bounds: mapBounds, container }}>
            {children}
          </MapViewportContext.Provider>
        )}
      </Viewport>
      {image.isLoading && (
        <LoadingSpinner size={96} sx={{ margin: "0 auto", marginTop: 4 }} />
      )}
      {!mapBounds && (
        <Typography color="error">
          Map bounds missing, cannot display pins
        </Typography>
      )}
    </>
  );
}

const Viewport = styled(Box, {
  shouldForwardProp: (prop) => prop !== "imageUrl",
})<{ imageUrl?: string }>`
  position: relative;
  background-color: ${(props) => props.theme.palette.divider};
  background-image: ${({ imageUrl }) =>
    imageUrl ? `url(${imageUrl})` : undefined};
  background-repeat: no-repeat;
  background-size: 100% 100%;
`;

export const MapCoordinate = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof MapCoordinateContainer> & { x: number; y: number }
>(({ x, y, style, children, ...props }, ref) => {
  const {
    bounds: { width, height },
  } = useContext(MapViewportContext);
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

export const MapViewportContext = createContext<{
  bounds: MapBounds;
  container?: HTMLElement;
}>({
  bounds: { width: 0, height: 0 },
});
