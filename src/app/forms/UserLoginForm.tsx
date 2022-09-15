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
    updateDelay: 0,
    error: props.error,
  });

  return (
    <CommonForm label="Sign in" {...props}>
      <TextField size="small" label="Username" {...field("username")} />
      <TextField
        size="small"
        label="Password"
        type="password"
        {...field("password")}
      />
    </CommonForm>
  );
}
