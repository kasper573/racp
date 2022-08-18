import { CircularProgress } from "@mui/material";
import FileUpload from "react-material-file-upload";
import { ComponentProps } from "react";

export interface FileUploaderProps extends ComponentProps<typeof FileUpload> {
  isLoading?: boolean;
}

export function FileUploader({ isLoading, ...props }: FileUploaderProps) {
  return (
    <FileUpload
      disabled={isLoading}
      buttonText={
        isLoading
          ? ((
              <CircularProgress size={24} color="inherit" />
            ) as unknown as string)
          : undefined
      }
      {...props}
    />
  );
}
