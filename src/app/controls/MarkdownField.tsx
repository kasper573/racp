import { TextField, TextFieldProps } from "./TextField";

export interface MarkdownFieldProps
  extends Omit<TextFieldProps, "value" | "onChange"> {
  value: string;
  onChange: (newValue: string) => void;
}

export function MarkdownField(props: MarkdownFieldProps) {
  return <TextField multiline {...(props as TextFieldProps)} />;
}
