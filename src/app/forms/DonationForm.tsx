import { Box, Button, InputAdornment, Stack, Typography } from "@mui/material";
import { ComponentProps, ReactNode, useState } from "react";
import {
  PayPalButtons as RealPayPalButton,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { TextField } from "../controls/TextField";
import { AdminPublicSettings, Money } from "../../api/services/settings/types";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { UserProfile } from "../../api/services/user/types";
import { calculateRewardedCredits } from "../../api/services/donation/utils/calculateRewardedCredits";
import { trpc } from "../state/client";
import { DonationCaptureResult } from "../../api/services/donation/types";

export function DonationForm({
  defaultAmount,
  exchangeRate,
  currency,
  paypalClientId,
  onSubmit,
}: {
  accountId: UserProfile["id"];
  onSubmit?: (money: Money) => void;
} & AdminPublicSettings["donations"]) {
  const { data: donationEnvironment = "pending" } =
    trpc.donation.environment.useQuery();
  const { mutateAsync: capture } = trpc.donation.capture.useMutation();
  const { mutateAsync: order } = trpc.donation.order.useMutation();
  const [donationState, setDonationState] = useState<DonationState>("idle");
  const [value, setValue] = useState(defaultAmount);
  const rewardedCredits = calculateRewardedCredits(value, exchangeRate);
  const mayDonate = donationState !== "pending";
  const donationStateDescription = describeDonationState(donationState);
  const PayPalButton = PayPalButtonProviders[donationEnvironment];

  return (
    <PayPalScriptProvider
      options={{
        currency,
        intent: "capture",
        "client-id": paypalClientId,
      }}
    >
      <PayPalSuspense
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
              <PayPalButton
                fundingSource="paypal"
                disabled={!mayDonate}
                createOrder={async () => {
                  setDonationState("idle");
                  const orderID = await order({ value, currency });
                  if (orderID === undefined) {
                    throw new Error("Could not create order");
                  }
                  return orderID;
                }}
                onCancel={() => setDonationState("cancel")}
                onError={() => setDonationState("error")}
                onApprove={async (data) => {
                  setDonationState("pending");
                  setDonationState(await capture(data));
                }}
              />
            </Box>
            {donationStateDescription && (
              <Stack direction="row" spacing={2} alignItems="center">
                {donationStateDescription.spinner && (
                  <div>
                    <LoadingSpinner />
                  </div>
                )}
                <Typography color={donationStateDescription.color}>
                  {donationStateDescription.message}
                </Typography>
              </Stack>
            )}
          </Stack>
        </form>
      </PayPalSuspense>
    </PayPalScriptProvider>
  );
}

function describeDonationState(
  state: DonationState
): { spinner?: boolean; message: string; color?: string } | false {
  const status = typeof state === "string" ? state : state.status;
  switch (status) {
    case "idle":
      return false;
    case "cancel":
      return {
        color: "info.main",
        message: "Your donation was canceled.",
      };
    case "pending":
      return {
        spinner: true,
        color: "info.main",
        message: "Your donation has been sent. Waiting for confirmation.",
      };
    case "invalidUser":
    case "unknownOrder":
    case "orderNotCompleted":
    case "noPaymentsReceived":
    case "error":
      return {
        color: "error",
        message:
          "Something went wrong. Your donation was not processed. Please try again later.",
      };
    case "refundDueToInternalError":
      return {
        color: "error",
        message:
          "Something went wrong after your donation went through. " +
          "A refund have been issued. Please try again later.",
      };
    case "internalErrorAndRefundFailed":
      return {
        color: "error",
        message:
          "Something went wrong after your donation went through. " +
          "A refund was attempted but could be issued. " +
          "Please contact an admin for a manual refund.",
      };
    case "creditsAwarded":
      return {
        color: "success.main",
        message: `Thank you for your donation. You have been awarded ${
          (state as DonationCaptureResult).rewardedCredits
        } credits!`,
      };
  }
}

type DonationState =
  | "idle"
  | "cancel"
  | "pending"
  | "error"
  | DonationCaptureResult;

function PayPalSuspense({
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

const PayPalButtonProviders = {
  sandbox: RealPayPalButton,
  live: RealPayPalButton,
  fake: FakePayPalButton,
  pending: () => <LoadingSpinner />,
};

/**
 * Fakes the PayPal flow. Used by E2E tests only.
 */
function FakePayPalButton({
  createOrder,
  onApprove,
}: ComponentProps<typeof RealPayPalButton>) {
  async function fake() {
    const orderID = await createOrder?.(
      { paymentSource: "paypal" },
      { order: { create: () => Promise.resolve("fake") } }
    );
    if (orderID !== undefined) {
      onApprove?.(
        { orderID, facilitatorAccessToken: "fake" },
        { redirect() {}, restart() {} }
      );
    }
  }
  return <Button onClick={fake}>Donate</Button>;
}
