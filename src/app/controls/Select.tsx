import {
  FormControl,
  Select as MuiSelect,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { ComponentProps, ReactNode, useMemo } from "react";
import { htmlId } from "../util/htmlId";

export interface SelectPropsBase<Value, Option>
  extends Omit<ComponentProps<typeof FormControl>, "onChange"> {
  options?: readonly Option[];
  label?: ReactNode;
  empty?: ReactNode;
  autoSort?: boolean;
  value?: Value;
  onChange?: (value?: Value) => void;
}

export type SelectProps<Value extends string> =
  | (SelectPropsBase<Value, Value> & { multi?: false })
  | (SelectPropsBase<Value[], Value> & { multi: true });

export function Select<Value extends string>({
  options = emptyStringList as Value[],
  multi,
  label,
  value,
  onChange,
  sx,
  id = typeof label === "string" ? htmlId(label) : undefined,
  empty = "No options",
  autoSort = true,
  ...props
}: SelectProps<Value>) {
  const sortedOptions = useMemo(
    () => (autoSort ? options.slice().sort() : options),
    [options, autoSort]
  );
  return (
    <FormControl sx={{ minWidth: 120, ...sx }} {...props}>
      {label && <InputLabel size="small">{label}</InputLabel>}
      <MuiSelect
        id={id}
        size="small"
        multiple={multi}
        value={multi ? value ?? emptyStringList : value ?? ""}
        label={label}
        onChange={
          multi
            ? (e) => {
                const values = e.target.value as Value[];
                onChange?.(values.length ? values : undefined);
              }
            : (e) => onChange?.(e.target.value as Value)
        }
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

const emptyStringList: string[] = [];
