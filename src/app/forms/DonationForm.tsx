import { Box, InputAdornment, Stack, Typography } from "@mui/material";
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
  const { mutateAsync: capture } = trpc.donation.capture.useMutation();
  const { mutateAsync: order } = trpc.donation.order.useMutation();
  const [status, setStatus] = useState<DonationStatus>("idle");
  const [value, setValue] = useState(defaultAmount);
  const rewardedCredits = calculateRewardedCredits(value, exchangeRate);
  const mayDonate = status !== "pending";
  const statusDescription = describeDonationStatus(status, rewardedCredits);

  return (
    <PayPalScriptProvider
      options={{
        currency,
        intent: "capture",
        "client-id": paypalClientId,
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
                disabled={!mayDonate}
                createOrder={async () => {
                  setStatus("idle");
                  const orderID = await order({ value, currency });
                  if (orderID === undefined) {
                    throw new Error("Could not create order");
                  }
                  return orderID;
                }}
                onCancel={() => setStatus("cancel")}
                onError={() => setStatus("error")}
                onApprove={async (data) => {
                  setStatus("pending");
                  setStatus(await capture(data));
                }}
              />
            </Box>
            {statusDescription && (
              <Stack direction="row" spacing={2} alignItems="center">
                {statusDescription.spinner && (
                  <div>
                    <LoadingSpinner />
                  </div>
                )}
                <Typography color={statusDescription.color}>
                  {statusDescription.message}
                </Typography>
              </Stack>
            )}
          </Stack>
        </form>
      </PayPalFallback>
    </PayPalScriptProvider>
  );
}

function describeDonationStatus(
  status: DonationStatus,
  rewardedCredits: number
): { spinner?: boolean; message: string; color?: string } | false {
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
        message: `Thank you for your donation. You have been awarded ${rewardedCredits} credits!`,
      };
  }
}

type DonationStatus =
  | "idle"
  | "cancel"
  | "pending"
  | "error"
  | DonationCaptureResult;

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
