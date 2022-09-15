import {
  UserAccessLevel,
  UserProfile,
  UserProfileMutation,
  userProfileMutationType,
} from "../../api/services/user/types";
import { useZodForm } from "../../lib/zod/useZodForm";
import { TextField } from "../controls/TextField";
import { getEnumName } from "../../lib/getEnumValue";
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
    updateDelay: 0,
    error: props.error,
  });

  return (
    <CommonForm {...props}>
      <TextField size="small" label="Username" value={profile.username} />
      <TextField
        size="small"
        label="Access"
        value={getEnumName(UserAccessLevel, profile.access)}
      />
      <TextField size="small" label="Email" {...field("email")} />
      <TextField
        optional
        size="small"
        label="New password"
        type="password"
        {...field("password")}
      />
      <TextField
        optional
        size="small"
        label="New password (confirm)"
        type="password"
        {...field("passwordConfirm")}
      />
    </CommonForm>
  );
}
