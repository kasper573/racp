import { Switch as MuiSwitch } from "@mui/material";
import { ComponentProps } from "react";

export interface SwitchProps
  extends Omit<
    ComponentProps<typeof MuiSwitch>,
    "value" | "checked" | "onChange"
  > {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function Switch({ value, onChange, ...props }: SwitchProps) {
  return (
    <MuiSwitch
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
      {...props}
    />
  );
}
