import { Typography } from "@mui/material";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { LoadingPage } from "./LoadingPage";

export default function DonationsPage() {
  const {
    data: settings,
    isLoading,
    error,
  } = trpc.settings.readPublic.useQuery();
  if (isLoading) {
    return <LoadingPage />;
  }
  if (error) {
    return <Header>Something went wrong</Header>;
  }
  return (
    <>
      <Header>Donations</Header>
      {settings?.donations.presentation.split(/[\r\n]+/).map((line, index) => (
        <Typography key={index} paragraph>
          {line}
        </Typography>
      ))}
    </>
  );
}
