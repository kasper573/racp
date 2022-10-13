import * as zod from "zod";

export type DonationCaptureResult = zod.infer<typeof donationCaptureResultType>;
export const donationCaptureResultType = zod.union([
  zod.literal("orderNotCompleted"),
  zod.literal("noPaymentsReceived"),
  zod.literal("unknownOrder"),
  zod.literal("invalidUser"),
  zod.literal("refundDueToInternalError"),
  zod.literal("internalErrorAndRefundFailed"),
  zod.literal("creditsAwarded"),
]);
