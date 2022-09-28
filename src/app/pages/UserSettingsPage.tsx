import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { UserProfileMutation } from "../../api/services/user/types";
import { UserProfileForm } from "../forms/UserProfileForm";
import { CenteredContent } from "../components/CenteredContent";
import { LoadingPage } from "./LoadingPage";

const defaultProfileMutation = {
  email: "",
};

export default function UserSettingsPage() {
  const { data: profile, isLoading } = trpc.user.getMyProfile.useQuery();
  const { mutate: updateMyProfile, error } =
    trpc.user.updateMyProfile.useMutation();
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
          error={error}
          profile={profile}
          value={profileMutation}
          onChange={setProfileMutation}
          onSubmit={(e) => {
            e.preventDefault();
            updateMyProfile(profileMutation);
          }}
        />
      </CenteredContent>
    </>
  );
}
