import { Stack } from "@mui/material";
import { LoginPayload, loginPayloadType } from "../../api/services/user/types";
import { useZodForm } from "../../lib/zod/useZodForm";
import { TextField } from "../controls/TextField";
import { CommonForm, CommonFormProps } from "../components/CommonForm";

export interface UserLoginFormProps extends CommonFormProps {
  value: LoginPayload;
  onChange: (changed: LoginPayload) => void;
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
    error: props.error,
  });

  return (
    <CommonForm label="Sign in" {...props}>
      <Stack spacing={2}>
        <TextField label="Username" {...field("username")} />
        <TextField label="Password" type="password" {...field("password")} />
      </Stack>
    </CommonForm>
  );
}
