import { Typography } from "@mui/material";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { DonationForm } from "../forms/DonationForm";
import { Money } from "../../api/services/settings/types";
import { Link } from "../components/Link";
import { router } from "../router";
import { Auth } from "../components/Auth";
import { UserAccessLevel } from "../../api/services/user/types";
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
      <Auth>
        {(user) =>
          user && (
            <DonationForm
              {...settings.donations}
              userId={user.id}
              onSubmit={startDonationProcess}
            />
          )
        }
      </Auth>
      <Auth exact={UserAccessLevel.Guest}>
        <Typography>
          You must be{" "}
          <Link to={router.user().login({ destination: router.donations().$ })}>
            signed in
          </Link>{" "}
          to make a donation.
        </Typography>
      </Auth>
    </>
  );
}
