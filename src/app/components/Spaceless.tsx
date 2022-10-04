import { Box } from "@mui/material";
import { ComponentProps } from "react";

export function Spaceless({
  children,
  offset,
  sx,
  ...props
}: ComponentProps<typeof Box> & {
  offset?: Partial<{
    left: number;
    right: number;
    top: number;
    bottom: number;
  }>;
}) {
  return (
    <Box sx={{ position: "relative", ...sx }} {...props}>
      <Box sx={{ position: "absolute", ...offset }}>{children}</Box>
    </Box>
  );
}
