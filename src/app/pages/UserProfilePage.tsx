import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import {
  UserAccessLevel,
  UserProfileMutation,
} from "../../api/services/user/types";
import { UserProfileForm } from "../forms/UserProfileForm";
import { authStore } from "../state/auth";
import { Page } from "../layout/Page";
import { getEnumName } from "../../lib/std/enum";

const defaultProfileMutation = {
  email: "",
};

export default function UserProfilePage() {
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
    <Page>
      <Header />
      Signed in as {profile.username} (
      {getEnumName(UserAccessLevel, profile.access)})
      <VipInfo />
      <Typography variant="h6" color="lightgray" paragraph sx={{ mt: 3 }}>
        Account settings
      </Typography>
      <UserProfileForm
        label="Update settings"
        sx={{ maxWidth: 500 }}
        error={error?.data}
        profile={profile}
        value={profileMutation}
        onChange={setProfileMutation}
        onSubmit={(e) => {
          e.preventDefault();
          submitProfileUpdate();
        }}
      />
    </Page>
  );
}

function VipInfo() {
  const { data: vipTime = 0 } = trpc.user.myVipTime.useQuery();
  const { isVip, endDate } = useMemo(() => {
    const now = new Date();
    const endDate = new Date(now.getTime() + vipTime * 60000);
    const isVip = endDate > now;
    return { endDate, isVip };
  }, [vipTime]);

  return (
    <>
      {isVip && (
        <Typography>
          You are VIP until {dateFormatter.format(endDate)}
        </Typography>
      )}
    </>
  );
}

const dateFormatter = new Intl.DateTimeFormat([], {
  dateStyle: "full",
  timeStyle: "long",
});
