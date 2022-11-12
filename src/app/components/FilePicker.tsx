import { ComponentProps, ReactNode, useEffect, useMemo, useRef } from "react";
import { Stack, styled, Typography } from "@mui/material";
import { ProgressButton } from "./ProgressButton";
import { BorderWithLabel } from "./BorderWithLabel";

export interface FilePickerProps<Value>
  extends Omit<ComponentProps<typeof Stack>, "onChange"> {
  buttonText?: ReactNode;
  isLoading?: boolean;
  value?: Value;
  onChange?: (files: Value) => void;
  name?: string;
  accept?: string;
  emptyText?: string;
  label?: ReactNode;
  disabled?: boolean;
  direction?: "row" | "column";
}

export function FilePicker({
  isLoading,
  value,
  onChange,
  buttonText = "Select file",
  name,
  accept,
  emptyText = "No file selected",
  disabled,
  label = name,
  direction = "row",
  ...props
}: FilePickerProps<File[]>) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!value?.length && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [value]);
  return (
    <BorderWithLabel label={label} {...props}>
      <HiddenInput
        type="file"
        ref={inputRef}
        name={name}
        accept={accept}
        onChange={(e) => onChange?.(fileListToArray(e.target.files))}
      />
      <Stack direction={direction} alignItems="center" spacing={2}>
        <Typography sx={{ textAlign: "center" }}>
          {value?.length
            ? value?.map((file) => file.name).join(", ")
            : emptyText}
        </Typography>
        <ProgressButton
          disabled={disabled}
          variant="contained"
          isLoading={isLoading}
          onClick={() => inputRef.current?.click()}
        >
          {buttonText}
        </ProgressButton>
      </Stack>
    </BorderWithLabel>
  );
}

const HiddenInput = styled("input")`
  display: none;
`;

function fileListToArray(list: FileList | null) {
  const array: File[] = [];
  if (list) {
    for (let i = 0; i < list.length; i++) {
      array.push(list.item(i)!);
    }
  }
  return array;
}
