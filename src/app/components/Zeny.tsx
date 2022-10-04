import { Theme, Typography, useTheme } from "@mui/material";
import { ComponentProps, useMemo } from "react";
import interpolate = require("color-interpolate");
import { clamp } from "lodash";

export function Zeny({
  value,
  sx,
  ...props
}: { value: number } & ComponentProps<typeof Typography>) {
  const theme = useTheme();
  const color = useMemo(
    () => getColor(value, createSteps(theme)),
    [value, theme]
  );
  return (
    <Typography sx={{ color, ...sx }} {...props}>
      {value.toLocaleString("en-US") + "z"}
    </Typography>
  );
}

function getColor(value: number, steps: ReturnType<typeof createSteps>) {
  value = Math.max(0, value);
  for (let i = 1; i < steps.length; i++) {
    const [min, colA] = steps[i - 1];
    const [max, colB] = steps[i];
    if (value >= min && value <= max) {
      return interpolate([colA, colB])(
        clamp((value - min) / (max - min), 0, 1)
      );
    }
  }
  return steps[steps.length - 1][1];
}

function createSteps(theme: Theme) {
  return [
    [0, theme.palette.text.primary],
    [10000, "#00ff00"],
    [100000, "#ffff00"],
    [1000000, "#ff8000"],
    [10000000, "#ff0000"],
  ] as const;
}
