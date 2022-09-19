import { ComponentProps, ReactNode, useEffect, useRef } from "react";
import { Stack, styled, Typography } from "@mui/material";
import { ProgressButton } from "./ProgressButton";

export interface FilePickerProps
  extends Omit<ComponentProps<typeof Stack>, "onChange"> {
  buttonText: ReactNode;
  isLoading?: boolean;
  value?: File[];
  onChange?: (files: File[]) => void;
  name?: string;
  accept?: string;
  emptyText?: string;
  disabled?: boolean;
}

export function FilePicker({
  isLoading,
  value,
  onChange,
  buttonText,
  name,
  accept,
  emptyText = "No file selected",
  disabled,
  ...props
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!value?.length && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [value]);
  return (
    <Stack direction="column" spacing={2} {...props}>
      <HiddenInput
        type="file"
        ref={inputRef}
        name={name}
        accept={accept}
        onChange={(e) => onChange?.(fileListToArray(e.target.files))}
      />
      <Typography sx={{ textAlign: "center" }}>
        {value?.length ? value?.map((file) => file.name).join(", ") : emptyText}
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
