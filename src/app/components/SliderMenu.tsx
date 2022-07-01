import { Slider, TextField } from "@mui/material";
import { ComponentProps, CSSProperties, ReactNode } from "react";
import { MenuOn } from "./MenuOn";

export interface SliderMenuProps extends ComponentProps<typeof Slider> {
  label?: ReactNode;
  width?: CSSProperties["width"];
}

export function SliderMenu({
  sx,
  style,
  className,
  value,
  label,
  width,
  ...props
}: SliderMenuProps) {
  return (
    <MenuOn
      closeOnMenuClicked={false}
      trigger={(open) => (
        <TextField
          size="small"
          onClick={open}
          value={value !== undefined ? String(value) : ""}
          label={label}
          inputProps={{ readOnly: true }}
          {...{ sx, style, className }}
        />
      )}
    >
      <Slider
        value={value}
        sx={{ ml: 3, mr: 3, display: "flex", width }}
        {...props}
      />
    </MenuOn>
  );
}
