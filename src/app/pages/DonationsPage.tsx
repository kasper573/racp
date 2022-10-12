import { Typography } from "@mui/material";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { DonationForm } from "../forms/DonationForm";
import { Money } from "../../api/services/settings/types";
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
  if (error || !settings) {
    return <Header>Something went wrong</Header>;
  }

  function startDonationProcess(money: Money) {
    // TODO: implement
  }

  return (
    <>
      <Header>Donations</Header>
      {settings.donations.presentation.split(/[\r\n]+/).map((line, index) => (
        <Typography key={index} paragraph>
          {line}
        </Typography>
      ))}
      <Header sx={{ mb: 3 }}>Make a donation</Header>
      <DonationForm
        exchangeRate={settings.donations.exchangeRate}
        defaultAmount={settings.donations.defaultAmount}
        currency={settings.donations.currency}
        onSubmit={startDonationProcess}
      />
    </>
  );
}