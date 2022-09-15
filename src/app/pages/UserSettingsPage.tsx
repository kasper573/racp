import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Header } from "../layout/Header";
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from "../state/client";
import { UserProfileMutation } from "../../api/services/auth/types";
import { UserProfileForm } from "../forms/UserProfileForm";
import { ErrorMessage } from "../components/ErrorMessage";
import { CenteredContent } from "../components/CenteredContent";
import { LoadingPage } from "./LoadingPage";

const defaultProfileMutation = {
  email: "",
  password: "",
  passwordConfirm: "",
};

export default function UserSettingsPage() {
  const { data: profile, isLoading } = useGetMyProfileQuery();
  const [updateMyProfile, { error }] = useUpdateMyProfileMutation();
  const [profileMutation, setProfileMutation] = useState<UserProfileMutation>(
    defaultProfileMutation
  );

  useEffect(() => {
    if (profileMutation === defaultProfileMutation && profile) {
      setProfileMutation({
        ...defaultProfileMutation,
        ...profile,
      });
    }
  }, [profileMutation, profile]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!profile) {
    // Should never happen since this page requires authentication
    return <Typography>Profile not available</Typography>;
  }

  return (
    <>
      <Header>Settings</Header>
      <CenteredContent>
        <UserProfileForm
          profile={profile}
          value={profileMutation}
          onChange={setProfileMutation}
          onSubmit={(e) => {
            e.preventDefault();
            updateMyProfile(profileMutation);
          }}
        >
          <ErrorMessage error={error} sx={{ marginBottom: 2 }} />
        </UserProfileForm>
      </CenteredContent>
    </>
  );
}
