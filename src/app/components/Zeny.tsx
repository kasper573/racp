import { Typography } from "@mui/material";
import { ComponentProps, useMemo } from "react";
import { useStore } from "zustand";
import { trpc } from "../state/client";
import { themeStore } from "../state/theme";
import { colorForAmount } from "../util/colorForAmount";

export function Zeny({
  value,
  sx,
  ...props
}: { value: number } & ComponentProps<typeof Typography>) {
  const { mode } = useStore(themeStore);
  const { data: settings } = trpc.settings.readPublic.useQuery();
  const colorStops = settings?.zenyColors[mode];
  const color = useMemo(
    () => (colorStops ? colorForAmount(value, colorStops) : undefined),
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
