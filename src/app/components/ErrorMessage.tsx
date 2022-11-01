import { Typography } from "@mui/material";
import { ComponentProps } from "react";
import { isZodError } from "../../lib/zod/isZodError";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorLike = any;

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

export function getErrorMessage(error?: ErrorLike): string | undefined {
  if (!error) {
    return;
  }
  if (Array.isArray(error)) {
    return error.map(getErrorMessage).join(", ");
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error !== "object") {
    return;
  }
  if (isZodError(error)) {
    return error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
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
