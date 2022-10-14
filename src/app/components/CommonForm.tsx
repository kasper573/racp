import { Box, Stack, styled } from "@mui/material";
import { ComponentProps, ComponentType, ReactNode } from "react";
import { ZodFormError } from "../../lib/zod/useZodForm";
import { isZodError } from "../../lib/zod/isZodError";
import { ErrorMessage } from "./ErrorMessage";
import { ProgressButton, ProgressButtonProps } from "./ProgressButton";

export interface CommonFormProps
  extends Omit<ComponentProps<typeof Form>, "onChange"> {
  error?: ZodFormError;
  label?: ReactNode;
  isLoading?: boolean;
  buttonComponent?: ComponentType<ProgressButtonProps>;
}

export function CommonForm({
  error,
  children,
  label = "Save",
  isLoading,
  buttonComponent: Button = ProgressButton,
  ...props
}: CommonFormProps) {
  return (
    <Form {...props}>
      {children}
      <Stack direction="row" sx={{ mt: 2 }}>
        <Box sx={{ flex: 1 }}>
          {
            // Display all errors except zod issues,
            // since fields will be handling their own errors.
            error && !isZodError(error) ? (
              <ErrorMessage error={error} />
            ) : undefined
          }
        </Box>
        <Button variant="contained" isLoading={isLoading} type="submit">
          {label}
        </Button>
      </Stack>
    </Form>
  );
}

const Form = styled("form")`
  display: flex;
  flex-direction: column;
`;
