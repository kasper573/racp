import { Box, Button, Stack } from "@mui/material";
import { HTMLAttributes } from "react";
import {
  UserAccessLevel,
  UserProfile,
  UserProfileMutation,
  userProfileMutationType,
} from "../../api/services/auth/types";
import { useZodForm } from "../../lib/zod/useZodForm";
import { TextField } from "../controls/TextField";
import { getEnumName } from "../../lib/getEnumValue";

export interface UserProfileFormProps
  extends Omit<HTMLAttributes<HTMLFormElement>, "onChange"> {
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
  });

  return (
    <form {...props}>
      <Stack direction="column" spacing={2} sx={{ marginBottom: 2 }}>
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
        <Stack direction="row">
          <Box sx={{ flex: 1 }}>{children}</Box>
          <Button type="submit">Save</Button>
        </Stack>
      </Stack>
    </form>
  );
}
