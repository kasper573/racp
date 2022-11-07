import { Box, styled, Typography } from "@mui/material";
import { ComponentProps, createContext, useState } from "react";
import { useImage } from "../../../lib/hooks/useImage";
import { MapBounds } from "../../../api/services/map/types";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { ImageWithFallback } from "../../components/ImageWithFallback";

export interface MapContainerProps extends ComponentProps<typeof Container> {
  bounds?: MapBounds;
  imageUrl?: string;
}

export function MapContainer({
  imageUrl,
  children,
  bounds: mapBounds,
  style,
  ...props
}: MapContainerProps) {
  const [container, setContainer] = useState<HTMLElement>();
  const image = useImage(imageUrl);
  return (
    <>
      <Container
        ref={setContainer}
        style={{
          width: "100%",
          aspectRatio: image.bounds
            ? `${image.bounds.width} / ${image.bounds.height}`
            : undefined,
          ...style,
        }}
        {...props}
      >
        <ImageWithFallback
          alt="Map"
          src={imageUrl}
          width="100%"
          sx={{ display: "flex" }}
        />
        {mapBounds && image.bounds && (
          <MapContainerContext.Provider
            value={{ bounds: mapBounds, container }}
          >
            {children}
          </MapContainerContext.Provider>
        )}
      </Container>
      {!imageUrl && <Typography color="error">Map image missing</Typography>}
      {image.isBroken && (
        <Typography color="error">Map image could not be loaded</Typography>
      )}
      {image.isLoading && (
        <LoadingIndicator size={96} sx={{ margin: "0 auto", marginTop: 4 }} />
      )}
      {!mapBounds && (
        <Typography color="error">
          Map bounds missing, cannot display pins
        </Typography>
      )}
    </>
  );
}

const Container = styled(Box)`
  position: relative;
  background-color: ${(props) => props.theme.palette.divider};
`;

export const MapContainerContext = createContext<{
  bounds: MapBounds;
  container?: HTMLElement;
}>({
  bounds: { width: 0, height: 0 },
});
