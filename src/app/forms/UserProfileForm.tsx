import { Stack } from "@mui/material";
import {
  UserProfile,
  UserProfileMutation,
  userProfileMutationType,
} from "../../api/services/user/types";
import { useZodForm } from "../../lib/zod/useZodForm";
import { TextField } from "../controls/TextField";
import { CommonForm, CommonFormProps } from "../components/CommonForm";

export interface UserProfileFormProps extends CommonFormProps {
  profile: UserProfile;
  value: UserProfileMutation;
  onChange: (changed: UserProfileMutation) => void;
}

export function UserProfileForm({
  profile,
  value,
  onChange,
  children,
  ...props
}: UserProfileFormProps) {
  const field = useZodForm({
    schema: userProfileMutationType,
    value,
    onChange,
    error: props.error,
  });

  return (
    <CommonForm {...props}>
      <Stack spacing={2}>
        <TextField label="Email" {...field("email")} />
        <TextField
          optional
          label="New password"
          type="password"
          {...field("password")}
        />
        <TextField
          optional
          label="New password (confirm)"
          type="password"
          {...field("passwordConfirm")}
        />
      </Stack>
    </CommonForm>
  );
}
