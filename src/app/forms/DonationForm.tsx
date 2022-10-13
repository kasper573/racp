import { Box, InputAdornment, Stack, Typography } from "@mui/material";
import { ReactNode, useState } from "react";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { TextField } from "../controls/TextField";
import {
  AdminPublicSettings,
  Currency,
  Money,
} from "../../api/services/settings/types";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AccountId, UserProfile } from "../../api/services/user/types";
import { DonationMetaData } from "../../api/services/donation/types";
import { calculateRewardedCredits } from "../../api/services/donation/utils/calculateRewardedCredits";
import { useBlockNavigation } from "../../lib/hooks/useBlockNavigation";

export function DonationForm({
  accountId,
  defaultAmount,
  exchangeRate,
  currency,
  paypalClientId,
  paypalMerchantId,
  onSubmit,
}: {
  accountId: UserProfile["id"];
  onSubmit?: (money: Money) => void;
} & AdminPublicSettings["donations"]) {
  const [status, setStatus] = useState<DonationStatus>("idle");
  const [value, setValue] = useState(defaultAmount);
  const rewardedCredits = calculateRewardedCredits(value, exchangeRate);
  const mayDonate = status !== "confirming";

  useBlockNavigation(
    status === "confirming",
    "Leaving this page while confirming your donation will make you lose track of the confirmation process. " +
      "The donation will finish, but you will not be notified of its resolution. Are you sure you want to leave?"
  );

  return (
    <PayPalScriptProvider
      options={{
        currency,
        "client-id": paypalClientId,
        "merchant-id": paypalMerchantId,
      }}
    >
      <PayPalFallback
        pending={<LoadingSpinner />}
        rejected={<>Could not connect to PayPal. Please try again later.</>}
        initial={<>Connecting to PayPal. Please wait a moment.</>}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.({ value, currency });
          }}
        >
          <Stack spacing={2}>
            <div>
              <TextField
                label="Donation amount"
                type="number"
                disabled={!mayDonate}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{currency}</InputAdornment>
                  ),
                }}
                helperText={`Donating ${value} ${currency} will reward you ${rewardedCredits} credits.`}
                value={value}
                onChange={setValue}
              />
            </div>
            <Box sx={{ maxWidth: 270 }}>
              <PayPalButtons
                fundingSource="paypal"
                style={{ label: "donate" }}
                disabled={!mayDonate}
                createOrder={(data, actions) => {
                  setStatus("idle");
                  return actions.order.create(
                    createDonationOrderOptions(value, currency, accountId)
                  );
                }}
                onApprove={async (data, actions) => {
                  if (!actions.order) {
                    return Promise.reject("No order");
                  }
                  try {
                    await actions.order
                      .capture()
                      .then(() => setStatus("confirming"));
                  } catch (error) {
                    setStatus("error");
                  }
                }}
                onCancel={() => setStatus("cancel")}
              />
            </Box>
            {status === "error" && (
              <Typography color="error">
                Something went wrong. Your donation was not processed. Please
                try again later.
              </Typography>
            )}
            {status === "confirming" && (
              <Stack direction="row" spacing={2} alignItems="center">
                <div>
                  <LoadingSpinner />
                </div>
                <Typography color="info.main">
                  Your donation has been sent. Waiting for confirmation.
                </Typography>
              </Stack>
            )}
            {status === "confirmed" && (
              <Typography color="success.main">
                Thank you for your donation. You have been awarded{" "}
                {rewardedCredits} credits!
              </Typography>
            )}
          </Stack>
        </form>
      </PayPalFallback>
    </PayPalScriptProvider>
  );
}

type DonationStatus = "idle" | "error" | "cancel" | "confirming" | "confirmed";

function PayPalFallback({
  children: resolved,
  pending,
  rejected,
  initial,
}: {
  children: ReactNode;
  pending: ReactNode;
  rejected: ReactNode;
  initial: ReactNode;
}) {
  const [{ isPending, isRejected, isInitial }] = usePayPalScriptReducer();
  if (isPending) {
    return <>{pending}</>;
  }
  if (isRejected) {
    return <>{rejected}</>;
  }
  if (isInitial) {
    return <>{initial}</>;
  }
  return <>{resolved}</>;
}

function createDonationOrderOptions(
  value: number,
  currency: Currency,
  accountId: AccountId
) {
  const metaData: DonationMetaData = { accountId };
  return {
    purchase_units: [
      {
        custom_id: JSON.stringify(metaData),
        amount: {
          value: value.toString(),
          breakdown: {
            item_total: {
              currency_code: currency,
              value: value.toString(),
            },
          },
        },
        items: [
          {
            name: "Donation",
            quantity: "1",
            category: "DONATION" as const,
            unit_amount: {
              currency_code: currency,
              value: value.toString(),
            },
          },
        ],
      },
    ],
  };
}
