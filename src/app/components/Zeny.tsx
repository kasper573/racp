import { Typography } from "@mui/material";
import { ComponentProps, useMemo } from "react";

export function Zeny({
  value,
  sx,
  ...props
}: { value: number } & ComponentProps<typeof Typography>) {
  const color = useMemo(() => getColor(value), [value]);
  return (
    <Typography sx={{ color, ...sx }} {...props}>
      {value.toLocaleString("en-US") + "z"}
    </Typography>
  );
}

function getColor(value: number) {
  if (value < 1000) {
    return "inherit";
  }
  if (value < 10000) {
    return "#1a951a"; // green
  }
  if (value < 100000) {
    return "#d0b046"; // yellow
  }
  if (value < 1000000) {
    return "#ff8000"; // orange
  }
  return "#ff0000"; // red
}
