import { ZodError, ZodType } from "zod";
import * as zod from "zod";
import { useEffect, useState } from "react";
import { useLatest } from "../../lib/hooks/useLatest";
import { TextField, TextFieldProps } from "./TextField";

export interface ZodFieldProps<T extends ZodType>
  extends Omit<
    TextFieldProps,
    "value" | "onChange" | "multiline" | "type" | "optional" | "error"
  > {
  schema: T;
  value: zod.infer<T>;
  onChange: (value: zod.infer<T>) => void;
}

export function ZodField<T extends ZodType>({
  value,
  onChange,
  schema,
  helperText,
  ...props
}: ZodFieldProps<T>) {
  const [error, setError] = useState<string>();
  const [json, setJson] = useState(() => readableJson(value));

  const latest = useLatest({ schema, onChange });
  useEffect(() => {
    try {
      const { schema, onChange } = latest.current;
      onChange(schema.parse(JSON.parse(json)));
      setError(undefined);
    } catch (e) {
      setError(e instanceof ZodError ? e.message : `${e}`);
    }
  }, [json, latest]);

  return (
    <TextField
      multiline
      error={!!error}
      helperText={error ?? helperText}
      value={json}
      onChange={setJson}
      {...props}
    />
  );
}

function readableJson(value: unknown) {
  if (value && typeof value === "object") {
    const entryStrings = Object.entries(value).map(
      ([key, value]) => `"${key}": ${JSON.stringify(value)}`
    );
    return `{\n${entryStrings.join(",\n")}\n}`;
  }
  return JSON.stringify(value);
}
