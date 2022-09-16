import { Button } from "@mui/material";
import { ComponentProps } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

export interface ProgressButtonProps extends ComponentProps<typeof Button> {
  isLoading?: boolean;
}

export function ProgressButton({
  children,
  disabled,
  isLoading,
  ...props
}: ProgressButtonProps) {
  return (
    <Button disabled={disabled || isLoading} {...props}>
      {isLoading ? <LoadingSpinner size={24} /> : children}
    </Button>
  );
}
