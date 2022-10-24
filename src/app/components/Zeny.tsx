import { Typography } from "@mui/material";
import { ComponentProps, useMemo } from "react";
import interpolate = require("color-interpolate");
import { clamp } from "lodash";
import { useStore } from "zustand";
import { trpc } from "../state/client";
import { ZenyColor } from "../../api/services/settings/types";
import { themeStore } from "../state/theme";

export function Zeny({
  value,
  sx,
  ...props
}: { value: number } & ComponentProps<typeof Typography>) {
  const { mode } = useStore(themeStore);
  const { data: settings } = trpc.settings.readPublic.useQuery();
  const colorStops = settings?.zenyColors[mode];
  const color = useMemo(
    () => (colorStops ? getColor(value, colorStops) : undefined),
    [value, colorStops]
  );
  return (
    <Typography
      sx={{ color, ...sx }}
      variant="body2"
      component="span"
      {...props}
    >
      {value.toLocaleString("en-US") + "z"}
    </Typography>
  );
}

function getColor(value: number, colors: ZenyColor[]) {
  value = Math.max(0, value);
  for (let i = 1; i < colors.length; i++) {
    const [min, colA] = colors[i - 1];
    const [max, colB] = colors[i];
    if (value >= min && value <= max) {
      return interpolate([colA, colB])(
        clamp((value - min) / (max - min), 0, 1)
      );
    }
  }
  return colors[colors.length - 1][1];
}
