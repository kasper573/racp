import { ComponentProps } from "react";
import { TextField as MuiTextField } from "@mui/material";

export function TextField({
  value = "",
  ...props
}: ComponentProps<typeof MuiTextField>) {
  return <MuiTextField value={value} {...props} />;
}
