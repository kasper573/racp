import { Box, Stack } from "@mui/material";
import { HTMLAttributes } from "react";
import {
  UserRegisterPayload,
  userRegisterPayloadType,
} from "../../api/services/auth/types";
import { useZodForm } from "../../lib/zod/useZodForm";
import { TextField } from "../controls/TextField";
import { ProgressButton } from "../components/ProgressButton";

export interface UserRegisterFormProps
  extends Omit<HTMLAttributes<HTMLFormElement>, "onChange"> {
  value: UserRegisterPayload;
  onChange: (changed: UserRegisterPayload) => void;
  isLoading?: boolean;
}

export function UserRegisterForm({
  value,
  onChange,
  children,
  isLoading,
  ...props
}: UserRegisterFormProps) {
  const field = useZodForm({
    schema: userRegisterPayloadType,
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
          label="Email"
          type="email"
          {...field("email")}
        />
        <TextField
          size="small"
          label="Password"
          type="password"
          {...field("password")}
        />
        <TextField
          size="small"
          label="Password (confirm)"
          type="password"
          {...field("passwordConfirm")}
        />
        <Stack direction="row">
          <Box sx={{ flex: 1 }}>{children}</Box>
          <ProgressButton isLoading={isLoading} type="submit">
            Register
          </ProgressButton>
        </Stack>
      </Stack>
    </form>
  );
}
