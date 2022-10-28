import { ComponentProps, useEffect, useState } from "react";
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
  const [text, setText] = useState(valueToText(value));
  useEffect(() => setText(valueToText(value)), [value]);

  function tryEmitChange(text: string) {
    if (type === "number") {
      const trimmed = text.trim();
      if (optional && trimmed === "") {
        onChange?.(undefined);
        return;
      }
      const num = parseFloat(trimmed);
      if (isNaN(num)) {
        return;
      }
      onChange?.(num);
      return;
    }

    optional ? onChange?.(text ? text : undefined) : onChange?.(text);
  }

  return (
    <MuiTextField
      size="small"
      type={type}
      id={id}
      label={label}
      error={(issues?.length ?? 0) > 0}
      helperText={issues?.join(", ")}
      value={text}
      disabled={readOnly}
      InputProps={{ readOnly }}
      onBlur={() => setText(valueToText(value))}
      onChange={(e) => {
        setText(e.target.value);
        tryEmitChange(e.target.value);
      }}
      {...props}
    />
  );
}

const valueToText = (value: unknown) => `${value ?? ""}`;
