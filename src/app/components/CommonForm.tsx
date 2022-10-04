import { Box, Stack } from "@mui/material";
import { HTMLAttributes, ReactNode } from "react";
import { ZodFormError } from "../../lib/zod/useZodForm";
import { isZodError } from "../../lib/zod/isZodError";
import { ErrorMessage } from "./ErrorMessage";
import { ProgressButton } from "./ProgressButton";

export interface CommonFormProps
  extends Omit<HTMLAttributes<HTMLFormElement>, "onChange"> {
  error?: ZodFormError;
  label?: ReactNode;
  isLoading?: boolean;
}

export function CommonForm({
  error,
  children,
  label = "Save",
  isLoading,
  ...props
}: CommonFormProps) {
  return (
    <form {...props}>
      <Stack direction="column" spacing={2} sx={{ marginBottom: 2 }}>
        {children}
        <Stack direction="row">
          <Box sx={{ flex: 1 }}>
            {
              // Display all errors except zod issues,
              // since fields will be handling their own errors.
              error && !isZodError(error) ? (
                <ErrorMessage error={error} />
              ) : undefined
            }
          </Box>
          <ProgressButton isLoading={isLoading} type="submit">
            {label}
          </ProgressButton>
        </Stack>
      </Stack>
    </form>
  );
}
