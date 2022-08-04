import { ComponentProps } from "react";
import { TextField } from "./TextField";

export type Range = [number, number];

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

  return (
    <>
      <TextField
        type="number"
        label={`${label} (min)`}
        value={a}
        optional
        onChange={(newA) =>
          onChange(newA === undefined ? undefined : [newA, b ?? 0])
        }
        {...props}
      />
      <TextField
        type="number"
        label={`${label} (max)`}
        value={b}
        optional
        onChange={(newB) =>
          onChange(newB === undefined ? undefined : [a ?? 0, newB])
        }
        {...props}
      />
    </>
  );
}
