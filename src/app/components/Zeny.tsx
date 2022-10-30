import { Typography, useTheme } from "@mui/material";
import { ComponentProps, useMemo } from "react";
import { colorForAmount, ColorStop } from "../util/colorForAmount";

export function Zeny({
  value,
  sx,
  ...props
}: { value: number } & ComponentProps<typeof Typography>) {
  const theme = useTheme();
  const color = useMemo(
    () => colorForAmount(value, zenyColors(theme.palette.text.primary)),
    [value, theme]
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

function zenyColors(primary: string): ColorStop[] {
  return [
    [0, primary],
    [10000, "#00ff00"],
    [100000, "#ffff00"],
    [1000000, "#ff8000"],
    [10000000, "#ff0000"],
  ];
}
