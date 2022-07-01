import {
  FormControl,
  Select as MuiSelect,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { ComponentProps, ReactNode } from "react";

export interface SelectPropsBase<T> extends ComponentProps<typeof FormControl> {
  options?: string[];
  label?: ReactNode;
  empty?: ReactNode;
}

export type SelectProps<T> =
  | (SelectPropsBase<T> & { value?: T; multiple?: false })
  | (SelectPropsBase<T> & { value?: T[]; multiple: true });

export function Select<T>({
  options = [],
  multiple,
  label,
  value,
  sx,
  empty = "No options",
  ...props
}: SelectProps<T>) {
  return (
    <FormControl sx={{ minWidth: 120, ...sx }} {...props}>
      {label && <InputLabel size="small">{label}</InputLabel>}
      <MuiSelect
        size="small"
        multiple={multiple}
        value={multiple ? value ?? [] : value}
        label={label}
      >
        {options.length === 0 ? (
          <MenuItem disabled>{empty}</MenuItem>
        ) : undefined}
        {options.map((option, index) => {
          return (
            <MenuItem key={index} value={option}>
              {option}
            </MenuItem>
          );
        })}
      </MuiSelect>
    </FormControl>
  );
}
