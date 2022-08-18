import { Typography } from "@mui/material";
import { ComponentProps } from "react";

export interface ErrorMessageProps
  extends Omit<ComponentProps<typeof Typography>, "children"> {
  error?: ErrorLike;
}

export function ErrorMessage({ error, ...props }: ErrorMessageProps) {
  const message = getErrorMessage(error);
  if (message === undefined) {
    return null;
  }
  return (
    <Typography color="error" {...props}>
      {message}
    </Typography>
  );
}

export function getErrorMessage<T extends ErrorLike>(
  error?: T
): string | undefined {
  if (!error) {
    return;
  }
  if (typeof error === "string") {
    return error;
  }
  if ("error" in error) {
    return `${error.error}`;
  }
  if ("message" in error) {
    return `${error.message}`;
  }
  if ("data" in error) {
    return error.data && typeof error.data === "object"
      ? getErrorMessage(error.data)
      : `${error.data}`;
  }
}

type ErrorLike =
  | string
  | { error?: string }
  | { message?: string }
  | { data?: Record<string, unknown> | unknown };
