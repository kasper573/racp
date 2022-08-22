import { Box, styled, Typography } from "@mui/material";
import { ComponentProps } from "react";
import { useImage } from "../hooks/useImage";

export function MapViewport({
  imageUrl,
  children,
  ...props
}: ComponentProps<typeof Viewport>) {
  const { image, isBroken } = useImage(imageUrl);
  return (
    <Box {...props}>
      <Viewport
        imageUrl={imageUrl}
        style={{ width: image?.width, height: image?.height }}
      >
        {!imageUrl && <Typography>Map image missing</Typography>}
        {isBroken && <Typography>Map image could not be loaded</Typography>}
        {image ? children : undefined}
      </Viewport>
    </Box>
  );
}

const Viewport = styled(Box)<{ imageUrl?: string }>`
  position: relative;
  background-image: ${({ imageUrl }) =>
    imageUrl ? `url(${imageUrl})` : undefined};
  background-repeat: no-repeat;
  background-size: cover;
`;

export const MapPin = styled(Box)<{ x: number; y: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  transform-origin: center;
  transform: ${({ x, y }) => `translate(${x}px, ${-y}px) translate(-50%, 50%)`};
`;
