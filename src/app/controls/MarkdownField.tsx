import { Box, Button, Link, styled } from "@mui/material";
import { useState } from "react";
import { Markdown } from "../components/Markdown";
import { BorderWithLabel } from "../components/BorderWithLabel";
import { TextField, TextFieldProps } from "./TextField";

export interface MarkdownFieldProps
  extends Omit<TextFieldProps, "value" | "onChange" | "helperText"> {
  value: string;
  onChange: (newValue: string) => void;
}

export function MarkdownField({
  sx,
  style,
  className,
  ...props
}: MarkdownFieldProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const styleProps = { sx, style, className };

  if (isPreviewing) {
    return (
      <BorderWithLabel label={props.label} {...styleProps}>
        <PreviewContainer>
          <Markdown>{props.value}</Markdown>
          <Button
            size="small"
            sx={{ position: "absolute", top: 0, right: 0 }}
            onClick={() => setIsPreviewing(false)}
          >
            Edit
          </Button>
        </PreviewContainer>
      </BorderWithLabel>
    );
  }
  return (
    <TextField
      multiline
      helperText={
        <>
          <Link href="https://commonmark.org/" target="_blank">
            Markdown
          </Link>{" "}
          is supported.
        </>
      }
      InputProps={{
        endAdornment: (
          <Button size="small" onClick={() => setIsPreviewing(true)}>
            Preview
          </Button>
        ),
      }}
      {...styleProps}
      {...(props as TextFieldProps)}
    />
  );
}

const PreviewContainer = styled(Box)`
  position: relative;
`;
