import { Typography } from "@mui/material";
import { Header } from "../layout/Header";
import { useGetMyProfileQuery } from "../state/client";
import { UserAccessLevel } from "../../api/services/auth/types";
import { getEnumName } from "../../lib/getEnumValue";
import { LoadingPage } from "./LoadingPage";

export default function UserProfilePage() {
  const { data: profile, isLoading } = useGetMyProfileQuery();
  if (isLoading) {
    return <LoadingPage />;
  }
  if (!profile) {
    // Should never happen since this page requires authentication
    return <Typography>Profile not available</Typography>;
  }
  return (
    <>
      <Header>My Profile</Header>
      <Typography>Username: {profile.username}</Typography>
      <Typography>Email: {profile.email}</Typography>
      <Typography>
        Access: {getEnumName(UserAccessLevel, profile.access)}
      </Typography>
    </>
  );
}
