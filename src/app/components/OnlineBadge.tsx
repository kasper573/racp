import { ComponentProps } from "react";
import { Badge } from "@mui/material";

export function OnlineBadge(props: ComponentProps<typeof Badge>) {
  return (
    <Badge
      data-testid="online-badge"
      overlap="circular"
      variant="dot"
      color="success"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      {...props}
    />
  );
}
