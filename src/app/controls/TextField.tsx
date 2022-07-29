import { ComponentProps } from "react";
import { TextField as MuiTextField } from "@mui/material";
import { util } from "zod/lib/helpers/util";
import MakePartial = util.MakePartial;

type TFVariant<Type extends string, Value, Optional extends boolean> = Omit<
  ComponentProps<typeof MuiTextField>,
  "onChange" | "type"
> & { type: Type } & (Optional extends true
    ? { optional: true; value?: Value; onChange: (newValue?: Value) => void }
    : { optional?: false; value: Value; onChange: (newValue: Value) => void });

export type TextFieldProps =
  | TFVariant<"number", number, false>
  | TFVariant<"number", number, true>
  | MakePartial<TFVariant<"text", string, false>, "type">
  | MakePartial<TFVariant<"text", string, true>, "type">;

export function TextField({
  value,
  type,
  onChange,
  optional,
  ...props
}: TextFieldProps) {
  return (
    <MuiTextField
      type={type}
      value={value ?? ""}
      onChange={
        type === "number"
          ? (e) =>
              optional
                ? e.target.value === ""
                  ? onChange(undefined)
                  : onChange(parseFloat(e.target.value))
                : onChange(parseFloat(e.target.value))
          : (e) =>
              optional
                ? onChange(e.target.value ? e.target.value : undefined)
                : onChange(e.target.value)
      }
      {...props}
    />
  );
}
