import { Box, useTheme } from "@mui/material";
import { useMemo } from "react";
import { colorForAmount, ColorStop } from "../util/colorForAmount";

export const Percentage = ({
  value,
  colorize = true,
}: {
  value: number;
  colorize?: boolean;
}) => {
  const theme = useTheme();
  const color = useMemo(
    () => colorForAmount(value, createColorStops(theme.palette.text.primary)),
    [value, theme.palette.text.primary]
  );
  return (
    <Box component="span" sx={{ color: colorize ? color : undefined }}>
      {value * 100}%
    </Box>
  );
};

const createColorStops = (defaultColor: string): ColorStop[] => [
  [0, "#ff0000"],
  [1, defaultColor],
  [2, "#00ff00"],
];
