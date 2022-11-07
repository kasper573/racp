import { Typography } from "@mui/material";
import { Header } from "../layout/Header";
import { trpc } from "../state/client";
import { DonationForm } from "../forms/DonationForm";
import { Link } from "../components/Link";
import { routes } from "../router";
import { Auth } from "../components/Auth";
import { UserAccessLevel } from "../../api/services/user/types";

export default function DonationsPage() {
  const { data: balance } = trpc.donation.balance.useQuery();
  const {
    data: settings,
    isLoading,
    error,
  } = trpc.settings.readPublic.useQuery();

  if (isLoading) {
    return null;
  }
  if (error || !settings) {
    return <Header title="Something went wrong" />;
  }

  return (
    <>
      <Header />
      {settings.donations.presentation.split(/[\r\n]+/).map((line, index) => (
        <Typography key={index} paragraph>
          {line}
        </Typography>
      ))}
      <Link to={routes.donation.items({})} sx={{ mb: 2 }}>
        Redeemable items
      </Link>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Make a donation
      </Typography>
      <Auth>
        {(user) =>
          user && (
            <>
              <DonationForm {...settings.donations} accountId={user.id} />
              <Typography sx={{ mt: 1 }}>
                You currently have {balance ?? "?"} credits
              </Typography>
            </>
          )
        }
      </Auth>
      <Auth exact={UserAccessLevel.Guest}>
        <Typography>
          You must be{" "}
          <Link to={routes.user.login({ destination: routes.donation({}) })}>
            signed in
          </Link>{" "}
          to make a donation.
        </Typography>
      </Auth>
    </>
  );
}
