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
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      onBlur={(e) => {
        const newValue = e.currentTarget.textContent ?? "";
        if (newValue !== value) {
          onChange?.(newValue);
        }
      }}
      {...props}
    />
  );
}
