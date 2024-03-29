import * as zod from "zod";

export type DonationEnvironment = zod.infer<typeof donationEnvironmentType>;
export const donationEnvironmentType = zod.union([
  zod.literal("fake"),
  zod.literal("sandbox"),
  zod.literal("live"),
]);
export const donationEnvironments = donationEnvironmentType.options.map(
  (o) => o.value
);

export type DonationCaptureStatus = zod.infer<typeof donationCaptureStatusType>;
export const donationCaptureStatusType = zod.union([
  zod.literal("orderNotCompleted"),
  zod.literal("noPaymentsReceived"),
  zod.literal("unknownOrder"),
  zod.literal("invalidUser"),
  zod.literal("refundDueToInternalError"),
  zod.literal("internalErrorAndRefundFailed"),
  zod.literal("creditsAwarded"),
]);

export type DonationCaptureResult = zod.infer<typeof donationCaptureResultType>;
export const donationCaptureResultType = zod.object({
  status: donationCaptureStatusType,
  rewardedCredits: zod.number().optional(),
});
