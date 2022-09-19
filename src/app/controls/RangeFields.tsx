import { ComponentProps } from "react";
import { defined } from "../../lib/std/defined";
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
  const [a, b] = value ?? ([undefined, undefined] as const);

  const emit = (range: Range) => onChange(flatten(range));

  return (
    <>
      <TextField
        type="number"
        label={`${label} (min)`}
        value={a}
        optional
        onChange={(n) => emit([n, b])}
        onBlur={() => emit([floor(a, b), b])}
        {...props}
      />
      <TextField
        type="number"
        label={`${label} (max)`}
        value={b}
        optional
        onChange={(n) => emit([a, n])}
        onBlur={() => emit([a, ceil(b, a)])}
        {...props}
      />
    </>
  );
}

const flatten = ([a, b]: Range): Range | undefined =>
  a === undefined && b === undefined ? undefined : [a, b];

export const floor = (val?: number, limit?: number) =>
  val === undefined ? val : Math.min(...defined([val, limit]));

export const ceil = (val?: number, limit?: number) =>
  val === undefined ? val : Math.max(...defined([val, limit]));
