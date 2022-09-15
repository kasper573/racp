import { Box, Button, Stack, styled } from "@mui/material";
import { ComponentProps } from "react";
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
  extends Omit<ComponentProps<typeof Form>, "onChange"> {
  profile: UserProfile;
  value: UserProfileMutation;
  onChange: (changed: UserProfileMutation) => void;
}

export function UserProfileForm({
  profile,
  value,
  onChange,
  ...props
}: UserProfileFormProps) {
  const field = useZodForm({
    schema: userProfileMutationType,
    value,
    onChange,
    updateDelay: 0,
  });

  return (
    <Form {...props}>
      <Stack direction="column" spacing={2} sx={{ marginBottom: 2 }}>
        <TextField size="small" label="Username" value={profile.username} />
        <TextField
          size="small"
          label="Access"
          value={getEnumName(UserAccessLevel, profile.access)}
        />
        <TextField size="small" label="Email" {...field("email")} />
        <TextField
          size="small"
          label="New password"
          type="password"
          {...field("password")}
        />
        <TextField
          size="small"
          label="New password (confirm)"
          type="password"
          {...field("passwordConfirm")}
        />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Button type="submit" sx={{ alignSelf: "flex-end" }}>
            Save
          </Button>
        </Box>
      </Stack>
    </Form>
  );
}

const Form = styled("form")`
  display: flex;
  flex-direction: column;
`;
