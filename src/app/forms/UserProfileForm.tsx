import { Stack } from "@mui/material";
import {
  UserAccessLevel,
  UserProfile,
  UserProfileMutation,
  userProfileMutationType,
} from "../../api/services/user/types";
import { useZodForm } from "../../lib/zod/useZodForm";
import { TextField } from "../controls/TextField";
import { getEnumName } from "../../lib/std/enum";
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
        <TextField label="Username" value={profile.username} />
        <TextField
          label="Access"
          value={getEnumName(UserAccessLevel, profile.access)}
        />
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
