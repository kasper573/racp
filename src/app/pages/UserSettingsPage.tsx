import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useStore } from "zustand";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { UserProfileMutation } from "../../api/services/user/types";
import { UserProfileForm } from "../forms/UserProfileForm";
import { CenteredContent } from "../components/CenteredContent";
import { authStore } from "../state/auth";

const defaultProfileMutation = {
  email: "",
};

export default function UserSettingsPage() {
  const { profile, setProfile } = useStore(authStore);

  const { mutateAsync: updateMyProfile, error } =
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

  async function submitProfileUpdate() {
    try {
      if (await updateMyProfile(profileMutation)) {
        setProfile({ ...profile!, ...profileMutation });
      }
    } catch {
      // there is no reason profile update should fail
    }
  }

  if (!profile) {
    // Should never happen since this page requires authentication
    return <Typography>Profile not available</Typography>;
  }

  return (
    <>
      <Header />
      <CenteredContent>
        <UserProfileForm
          error={error?.data}
          profile={profile}
          value={profileMutation}
          onChange={setProfileMutation}
          onSubmit={(e) => {
            e.preventDefault();
            submitProfileUpdate();
          }}
        />
      </CenteredContent>
    </>
  );
}
