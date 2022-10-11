import { ZodError, ZodType } from "zod";
import * as zod from "zod";
import { ReactNode, useState } from "react";
import { useElevatedState } from "../../lib/hooks/useElevatedState";
import { TextField } from "./TextField";

export interface ZodFieldProps<T extends ZodType> {
  schema: T;
  label?: ReactNode;
  value: zod.infer<T>;
  onChange: (value: zod.infer<T>) => void;
}

export function ZodField<T extends ZodType>({
  label,
  value,
  onChange,
  schema,
}: ZodFieldProps<T>) {
  const [error, setError] = useState<string>();
  const [json, setJson] = useElevatedState({
    value: readableJson(value),
    onChange: onJsonChange,
  });

  function onJsonChange(newJson: string) {
    try {
      onChange(schema.parse(JSON.parse(newJson)));
      setError(undefined);
    } catch (e) {
      setError(e instanceof ZodError ? e.message : `${e}`);
    }
  }

  return (
    <TextField
      multiline
      error={!!error}
      helperText={error}
      label={label}
      value={json}
      onChange={setJson}
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
