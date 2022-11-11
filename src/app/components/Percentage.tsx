import { Box, useTheme } from "@mui/material";
import { ComponentProps, forwardRef, useMemo } from "react";
import { colorForAmount, ColorStop } from "../util/colorForAmount";

export const Percentage = forwardRef(
  (
    {
      value,
      colorize = true,
      sx,
      ...props
    }: ComponentProps<typeof Box> & {
      value: number;
      colorize?: boolean;
    },
    ref
  ) => {
    const theme = useTheme();
    const color = useMemo(
      () => colorForAmount(value, createColorStops(theme.palette.text.primary)),
      [value, theme.palette.text.primary]
    );
    return (
      <Box
        ref={ref}
        component="span"
        sx={{ color: colorize ? color : undefined, ...sx }}
        {...props}
      >
        {value * 100}%
      </Box>
    );
  }
);

const createColorStops = (defaultColor: string): ColorStop[] => [
  [0, "#ff0000"],
  [1, defaultColor],
  [2, "#00ff00"],
];
