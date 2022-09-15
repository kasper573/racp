import { Box, Stack } from "@mui/material";
import { HTMLAttributes } from "react";
import { LoginPayload, loginPayloadType } from "../../api/services/auth/types";
import { useZodForm } from "../../lib/zod/useZodForm";
import { TextField } from "../controls/TextField";
import { ProgressButton } from "../components/ProgressButton";

export interface UserLoginFormProps
  extends Omit<HTMLAttributes<HTMLFormElement>, "onChange"> {
  value: LoginPayload;
  onChange: (changed: LoginPayload) => void;
  isLoading?: boolean;
}

export function UserLoginForm({
  value,
  onChange,
  children,
  isLoading,
  ...props
}: UserLoginFormProps) {
  const field = useZodForm({
    schema: loginPayloadType,
    value,
    onChange,
    updateDelay: 0,
  });

  return (
    <form {...props}>
      <Stack direction="column" spacing={2} sx={{ marginBottom: 2 }}>
        <TextField size="small" label="Username" {...field("username")} />
        <TextField
          size="small"
          label="Password"
          type="password"
          {...field("password")}
        />
        <Stack direction="row">
          <Box sx={{ flex: 1 }}>{children}</Box>
          <ProgressButton isLoading={isLoading} type="submit">
            Sign in
          </ProgressButton>
        </Stack>
      </Stack>
    </form>
  );
}
