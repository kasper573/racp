import { styled } from "@mui/material";
import { ComponentProps } from "react";

export function TextEditor({
  value,
  onChange,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
} & Omit<ComponentProps<typeof Text>, "value" | "onChange">) {
  return (
    <Text value={value} onChange={(e) => onChange(e.target.value)} {...props} />
  );
}

const Text = styled("textarea")`
  display: flex;
  flex: 1;
  background-color: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.text.primary};
`;
