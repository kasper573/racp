import { Box, styled, Typography } from "@mui/material";
import {
  ComponentProps,
  createContext,
  forwardRef,
  useContext,
  useState,
} from "react";
import { useImage } from "../hooks/useImage";
import { MapBounds } from "../../api/services/map/types";

export interface MapViewportProps extends ComponentProps<typeof Viewport> {
  bounds?: MapBounds;
}

export function MapViewport({
  imageUrl,
  children,
  bounds,
  style,
  ...props
}: MapViewportProps) {
  const [container, setContainer] = useState<HTMLElement>();
  const { image, isBroken } = useImage(imageUrl);
  return (
    <>
      <Viewport
        ref={setContainer}
        imageUrl={image?.src}
        style={{
          width: "100%",
          aspectRatio: image ? `${image.width} / ${image.height}` : undefined,
          ...style,
        }}
        {...props}
      >
        {!imageUrl && <Typography color="error">Map image missing</Typography>}
        {isBroken && (
          <Typography color="error">Map image could not be loaded</Typography>
        )}
        {bounds && image && (
          <MapViewportContext.Provider value={{ bounds, container }}>
            {children}
          </MapViewportContext.Provider>
        )}
      </Viewport>
      {!bounds && (
        <Typography color="error">
          Map bounds missing, cannot display pins
        </Typography>
      )}
    </>
  );
}

const Viewport = styled(Box)<{ imageUrl?: string }>`
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
