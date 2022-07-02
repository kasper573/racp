import { Slider, TextField, TextFieldProps } from "@mui/material";
import { ComponentProps, CSSProperties, ReactNode } from "react";
import { MenuOn } from "../components/MenuOn";

interface SliderMenuPropsBase<Value>
  extends Omit<
    ComponentProps<typeof Slider>,
    "defaultValue" | "onChange" | "value"
  > {
  label?: ReactNode;
  width?: CSSProperties["width"];
  size?: TextFieldProps["size"];
  value?: Value;
  onChange?: (value?: Value) => void;
}

export type SliderMenuProps =
  | (SliderMenuPropsBase<number> & { ranged?: false })
  | (SliderMenuPropsBase<[number, number]> & { ranged: true });

export function SliderMenu({
  sx,
  style,
  className,
  size,
  label,
  width = 150,
  step = 1,
  min = 0,
  max = min + 1,
  onChange,
  ranged,
  value = ranged ? [min, max] : min,
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
        value={ranged ? value ?? [min, max] : value ?? min}
        marks
        step={step}
        min={min}
        max={max}
        valueLabelDisplay="auto"
        sx={{ ml: 3, mr: 3, display: "flex", width }}
        onChange={
          ranged
            ? (e, value) => onChange?.(value as [number, number])
            : (e, value) => onChange?.(value as number)
        }
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
    const [a, b] = value;
    return a === b ? String(a) : `${value[0]} to ${value[1]}`;
  }
  return String(value);
}
