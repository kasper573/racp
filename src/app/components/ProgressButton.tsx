import { Button } from "@mui/material";
import { ComponentProps, useState } from "react";
import { LoadingIndicator } from "./LoadingIndicator";

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
      {isLoading ? <LoadingIndicator size={24} /> : children}
    </Button>
  );
}

export function AsyncProgressButton({
  children,
  ...props
}: Omit<ProgressButtonProps, "onClick" | "isLoading"> & {
  onClick: () => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <ProgressButton
      {...props}
      isLoading={isLoading}
      onClick={async () => {
        setIsLoading(true);
        try {
          await props.onClick();
        } finally {
          setIsLoading(false);
        }
      }}
    >
      {children}
    </ProgressButton>
  );
}
