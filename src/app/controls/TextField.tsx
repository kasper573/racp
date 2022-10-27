import { ComponentProps } from "react";
import { TextField as MuiTextField } from "@mui/material";
import { util } from "zod/lib/helpers/util";
import { htmlId } from "../util/htmlId";
import MakePartial = util.MakePartial;

type TFVariant<Type extends string, Value, Optional extends boolean> = Omit<
  ComponentProps<typeof MuiTextField>,
  "onChange" | "type"
> & { type: Type; issues?: string[] } & (Optional extends true
    ? { optional: true; value?: Value; onChange?: (newValue?: Value) => void }
    : { optional?: false; value: Value; onChange?: (newValue: Value) => void });

export type TextFieldProps =
  | TFVariant<"number", number, false>
  | TFVariant<"number", number, true>
  | MakePartial<TFVariant<"text", string, false>, "type">
  | MakePartial<TFVariant<"text", string, true>, "type">
  | MakePartial<TFVariant<"password", string, false>, "type">
  | MakePartial<TFVariant<"password", string, true>, "type">
  | MakePartial<TFVariant<"email", string, false>, "type">
  | MakePartial<TFVariant<"email", string, true>, "type">;

export function TextField({
  value,
  type,
  onChange,
  optional,
  issues,
  label,
  id = typeof label === "string" ? htmlId(label) : undefined,
  ...props
}: TextFieldProps) {
  const readOnly = onChange === undefined;
  return (
    <MuiTextField
      size="small"
      type={type === "number" ? "text" : type}
      id={id}
      label={label}
      error={(issues?.length ?? 0) > 0}
      helperText={issues?.join(", ")}
      value={value ?? ""}
      disabled={readOnly}
      InputProps={{ readOnly }}
      onChange={
        type === "number"
          ? (e) =>
              optional
                ? e.target.value === ""
                  ? onChange?.(undefined)
                  : onChange?.(parseFloat(e.target.value))
                : onChange?.(parseFloat(e.target.value || "0"))
          : (e) =>
              optional
                ? onChange?.(e.target.value ? e.target.value : undefined)
                : onChange?.(e.target.value)
      }
      {...props}
    />
  );
}
