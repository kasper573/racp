import {
  FormControl,
  Select as MuiSelect,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { ComponentProps, ReactNode, useMemo } from "react";

export interface SelectPropsBase<T> extends ComponentProps<typeof FormControl> {
  options?: string[];
  label?: ReactNode;
  empty?: ReactNode;
  autoSort?: boolean;
}

export type SelectProps<T> =
  | (SelectPropsBase<T> & { value?: T; multiple?: false })
  | (SelectPropsBase<T> & { value?: T[]; multiple: true });

export function Select<T>({
  options = noOptions,
  multiple,
  label,
  value,
  sx,
  empty = "No options",
  autoSort = true,
  ...props
}: SelectProps<T>) {
  const sortedOptions = useMemo(
    () => (autoSort ? options.slice().sort() : options),
    [options, autoSort]
  );
  return (
    <FormControl sx={{ minWidth: 120, ...sx }} {...props}>
      {label && <InputLabel size="small">{label}</InputLabel>}
      <MuiSelect
        size="small"
        multiple={multiple}
        value={multiple ? value ?? [] : value}
        label={label}
      >
        {sortedOptions.length === 0 ? (
          <MenuItem disabled>{empty}</MenuItem>
        ) : undefined}
        {sortedOptions.map((option, index) => {
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

const noOptions: string[] = [];
