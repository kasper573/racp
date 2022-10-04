import { Stack } from "@mui/material";
import { ReactNode } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

export function IconWithLabel({
  src,
  alt,
  children,
}: {
  src?: string;
  alt: string;
  children: ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <ImageWithFallback src={src} alt={alt} sx={{ height: 17 }} />
      {children}
    </Stack>
  );
}
