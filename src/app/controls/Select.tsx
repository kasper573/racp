import {
  FormControl,
  Select as MuiSelect,
  InputLabel,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { ComponentProps, ReactNode, useMemo } from "react";
import { htmlId } from "../util/htmlId";

export type SelectProps<Option, Value> = Omit<
  ComponentProps<typeof FormControl>,
  "onChange"
> & {
  options?: readonly Option[];
  label?: ReactNode;
  empty?: ReactNode;
  autoSort?: boolean;
  helperText?: ReactNode;
  getOptionValue?: (option: Option) => Value;
} & (
    | { multi?: false; value?: Value; onChange?: (value?: Value) => void }
    | {
        multi?: false;
        required: true;
        value: Value;
        onChange: (value: Value) => void;
      }
    | { multi: true; value?: Value[]; onChange?: (value?: Value[]) => void }
    | {
        multi: true;
        required: true;
        value: Value[];
        onChange: (value: Value[]) => void;
      }
  );

export function Select<Option extends string, Value = Option>({
  options = emptyStringList as Option[],
  multi,
  label,
  value,
  helperText,
  onChange,
  sx,
  id = typeof label === "string" ? htmlId(label) : undefined,
  empty = "No options",
  autoSort = true,
  required,
  getOptionValue = (option) => option as unknown as Value,
  ...props
}: SelectProps<Option, Value>) {
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
            ? required
              ? (e) => {
                  const selectedOptions = e.target.value as Option[];
                  if (selectedOptions.length) {
                    onChange?.(selectedOptions.map(getOptionValue));
                  }
                }
              : (e) => {
                  const options = e.target.value as Option[];
                  onChange?.(
                    options.length ? options.map(getOptionValue) : undefined
                  );
                }
            : required
            ? (e) => {
                if (e.target.value) {
                  onChange?.(getOptionValue(e.target.value as Option));
                }
              }
            : (e) => {
                onChange?.(getOptionValue(e.target.value as Option));
              }
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
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

const emptyStringList: string[] = [];
