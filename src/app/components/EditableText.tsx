import { Typography, TypographyProps } from "@mui/material";
import { useEffect, useRef } from "react";

export function EditableText({
  value,
  enabled = true,
  onChange,
  ...props
}: Omit<TypographyProps, "onChange"> & {
  value: string;
  onChange: (newValue: string) => void;
  enabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);
  return (
    <Typography
      ref={ref}
      contentEditable={enabled}
      suppressContentEditableWarning={enabled}
      onInput={(e) => onChange?.(e.currentTarget.textContent ?? "")}
      {...props}
    />
  );
}
