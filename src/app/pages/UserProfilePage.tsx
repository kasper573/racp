import { Typography } from "@mui/material";
import { Header } from "../layout/Header";
import { useGetMyProfileQuery } from "../state/client";

export default function UserProfilePage() {
  const { data: profile } = useGetMyProfileQuery();
  return (
    <>
      <Header>My Profile</Header>
      <Typography>Account name: {profile?.username}</Typography>
    </>
  );
}
