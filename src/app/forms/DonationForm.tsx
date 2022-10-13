import { InputAdornment, Stack } from "@mui/material";
import { ReactNode, useState } from "react";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { TextField } from "../controls/TextField";
import { AdminPublicSettings, Money } from "../../api/services/settings/types";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { UserProfile } from "../../api/services/user/types";
import { DonationMetaData } from "../../api/services/donation/types";
import { calculateRewardedCredits } from "../../api/services/donation/utils/calculateRewardedCredits";

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
  const [details, setDetails] = useState<unknown>();
  const [value, setValue] = useState(defaultAmount);
  const rewardedCredits = calculateRewardedCredits(value, exchangeRate);

  return (
    <PayPalScriptProvider
      options={{
        currency,
        "client-id": paypalClientId,
        "merchant-id": paypalMerchantId,
      }}
    >
      {JSON.stringify(details)}
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
            <PayPalButtons
              createOrder={(data, actions) => {
                const metaData: DonationMetaData = { accountId };
                return actions.order.create({
                  purchase_units: [
                    {
                      custom_id: JSON.stringify(metaData),
                      amount: { value: value.toString() },
                    },
                  ],
                });
              }}
              onApprove={async (data, actions) => {
                if (!actions.order) {
                  return Promise.reject("No order");
                }
                try {
                  await actions.order
                    .capture()
                    .then((details) => setDetails({ details }));
                } catch (error) {
                  setDetails({ error: `${error}` });
                }
              }}
              onCancel={() => setDetails("cancel")}
            />
          </Stack>
        </form>
      </PayPalFallback>
    </PayPalScriptProvider>
  );
}

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
