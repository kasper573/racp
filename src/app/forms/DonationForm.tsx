import { Box, Button, InputAdornment, Stack, Typography } from "@mui/material";
import { ComponentProps, ReactNode, useRef, useState } from "react";
import {
  PayPalButtons as RealPayPalButton,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { TextField } from "../controls/TextField";
import { AdminPublicSettings } from "../../api/services/settings/types";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { UserProfile } from "../../api/services/user/types";
import { calculateRewardedCredits } from "../../api/services/donation/utils/calculateRewardedCredits";
import { trpc } from "../state/client";
import { DonationCaptureResult } from "../../api/services/donation/types";

export function DonationForm({
  minimumAmount,
  exchangeRate,
  currency,
  paypal,
}: {
  accountId: UserProfile["id"];
} & AdminPublicSettings["donations"]) {
  const { data: donationEnvironment = "pending" } =
    trpc.donation.environment.useQuery();
  const { mutateAsync: capture } = trpc.donation.capture.useMutation();
  const { mutateAsync: order } = trpc.donation.order.useMutation();
  const [donationState, setDonationState] = useState<DonationState>("idle");
  const [value, setValue] = useState(minimumAmount);
  const rewardedCredits = calculateRewardedCredits(value, exchangeRate);
  const isDonating = donationState === "pending";
  const mayDonate = !isDonating && value >= minimumAmount;
  const donationStateDescription = describeDonationState(donationState);
  const PayPalButton = PayPalButtonProviders[donationEnvironment];
  const current = { value, currency };
  const latest = useRef(current);
  latest.current = current;

  return (
    <PayPalScriptProvider
      options={{
        currency,
        intent: "capture",
        "client-id": paypal?.clientId ?? "",
      }}
    >
      <PayPalSuspense
        pending={<LoadingIndicator />}
        rejected={<>Could not connect to PayPal. Please try again later.</>}
        initial={<>Connecting to PayPal. Please wait a moment.</>}
      >
        <Stack spacing={2}>
          <div>
            <TextField
              label="Donation amount"
              type="number"
              disabled={isDonating}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">{currency}</InputAdornment>
                ),
              }}
              helperText={
                value < minimumAmount ? (
                  <Typography variant="caption" color="error">
                    Minimum donation amount is {minimumAmount} {currency}
                  </Typography>
                ) : (
                  `Donating ${value} ${currency} will reward you ${rewardedCredits} credits.`
                )
              }
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
                const orderID = await order(latest.current);
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
                  <LoadingIndicator />
                </div>
              )}
              <Typography color={donationStateDescription.color}>
                {donationStateDescription.message}
              </Typography>
            </Stack>
          )}
        </Stack>
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
          "A refund was attempted but could not be issued. " +
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
  pending: () => <LoadingIndicator />,
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
