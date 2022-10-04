import { ComponentProps } from "react";
import { TextField } from "./TextField";

export type Range = [number | undefined, number | undefined];

export interface RangeFieldsProps
  extends Omit<
    ComponentProps<typeof TextField>,
    "type" | "onChange" | "value" | "optional"
  > {
  value?: Range;
  onChange: (newValue?: Range) => void;
}

export function RangeFields({
  value,
  onChange,
  label,
  ...props
}: RangeFieldsProps) {
  let [a, b] = value ?? ([undefined, undefined] as const);

  // Ensure no nulls for runtime safety
  a = a ?? undefined;
  b = b ?? undefined;

  const emit = (range: Range) => onChange(flatten(range));

  return (
    <>
      <TextField
        type="number"
        label={`${label} (min)`}
        value={a}
        optional
        onChange={(n) => emit([n, b])}
        {...props}
      />
      <TextField
        type="number"
        label={`${label} (max)`}
        value={b}
        optional
        onChange={(n) => emit([a, n])}
        {...props}
      />
    </>
  );
}

const flatten = ([a, b]: Range): Range | undefined =>
  a === undefined && b === undefined ? undefined : [a, b];
