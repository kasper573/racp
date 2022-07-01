import { Slider, TextField, TextFieldProps } from "@mui/material";
import { ComponentProps, CSSProperties, ReactNode } from "react";
import { MenuOn } from "../components/MenuOn";

export interface SliderMenuProps
  extends Omit<ComponentProps<typeof Slider>, "defaultValue"> {
  label?: ReactNode;
  width?: CSSProperties["width"];
  size?: TextFieldProps["size"];
}

export function SliderMenu({
  sx,
  style,
  className,
  size,
  value,
  label,
  width = 150,
  step = 1,
  min = 0,
  max = min + 1,
  ...props
}: SliderMenuProps) {
  return (
    <MenuOn
      closeOnMenuClicked={false}
      trigger={(open) => (
        <TextField
          size={size}
          onClick={open}
          value={valueToString(value)}
          label={label}
          inputProps={{ readOnly: true }}
          {...{ sx, style, className }}
        />
      )}
    >
      <Slider
        value={value}
        marks
        step={step}
        min={min}
        max={max}
        valueLabelDisplay="auto"
        sx={{ ml: 3, mr: 3, display: "flex", width }}
        {...props}
      />
    </MenuOn>
  );
}

function valueToString(value?: number | number[]): string {
  if (value === undefined) {
    return "";
  }
  if (Array.isArray(value)) {
    return `${value[0]} to ${value[1]}`;
  }
  return String(value);
}
