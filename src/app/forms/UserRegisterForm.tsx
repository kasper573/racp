import {
  UserRegisterPayload,
  userRegisterPayloadType,
} from "../../api/services/user/types";
import { useZodForm } from "../../lib/zod/useZodForm";
import { TextField } from "../controls/TextField";
import { CommonForm, CommonFormProps } from "../components/CommonForm";

export interface UserRegisterFormProps extends CommonFormProps {
  value: UserRegisterPayload;
  onChange: (changed: UserRegisterPayload) => void;
}

export function UserRegisterForm({
  value,
  onChange,
  children,
  ...props
}: UserRegisterFormProps) {
  const field = useZodForm({
    schema: userRegisterPayloadType,
    value,
    onChange,
    updateDelay: 0,
    error: props.error,
  });

  return (
    <CommonForm label="Register" {...props}>
      <TextField label="Username" {...field("username")} />
      <TextField label="Email" type="email" {...field("email")} />
      <TextField label="Password" type="password" {...field("password")} />
      <TextField
        label="Password (confirm)"
        type="password"
        {...field("passwordConfirm")}
      />
    </CommonForm>
  );
}
