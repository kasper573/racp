import * as zod from "zod";
import * as paypal from "@paypal/checkout-server-sdk";
import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { AccountId, UserAccessLevel } from "../user/types";
import { Logger } from "../../../lib/logger";
import { AdminSettingsRepository } from "../settings/repository";
import { DatabaseDriver } from "../../rathena/DatabaseDriver";
import { AdminSettings, moneyType } from "../settings/types";
import { donationCaptureResultType } from "./types";
import { rewardUserWithCredits } from "./utils/rewardUserWithCredits";

export type DonationService = ReturnType<typeof createDonationService>;

export function createDonationService({
  db,
  env,
  settings,
  logger,
}: {
  db: DatabaseDriver;
  env: PaypalEnvironment;
  settings: AdminSettingsRepository;
  logger: Logger;
}) {
  return t.router({
    order: t.procedure
      .input(moneyType)
      .output(zod.string().optional())
      .use(access(UserAccessLevel.User))
      .mutation(async ({ input: { value, currency }, ctx: { auth } }) => {
        const client = createPayPalClient(settings.getSettings(), env);
        const { result }: { result?: paypal.orders.Order } =
          await client.execute(
            new paypal.orders.OrdersCreateRequest().requestBody({
              intent: "CAPTURE",
              purchase_units: [
                {
                  custom_id: accountIdToCustomId(auth.id),
                  amount: {
                    value: value.toString(),
                    currency_code: currency,
                  },
                },
              ],
            })
          );
        return result?.id;
      }),
    capture: t.procedure
      .input(zod.object({ orderID: zod.string() }))
      .output(donationCaptureResultType)
      .use(access(UserAccessLevel.User))
      .mutation(
        async ({
          input: { orderID },
          ctx: {
            auth: { id: accountId },
          },
        }) => {
          const client = createPayPalClient(settings.getSettings(), env);

          const { result: order }: { result?: paypal.orders.Order } =
            await client.execute(new paypal.orders.OrdersGetRequest(orderID));

          if (!order) {
            return "unknownOrder";
          }

          const orderAccountId = customIdToAccountId(
            order.purchase_units[0]?.custom_id
          );

          if (orderAccountId !== accountId) {
            logger.warn(
              `Order ${orderID} (account ${orderAccountId}) was not created for ` +
                `acting user ${accountId}. Will not reward user.`
            );
            return "invalidUser";
          }

          const { result }: { result?: paypal.orders.Order } =
            await client.execute(
              new paypal.orders.OrdersCaptureRequest(orderID).requestBody(
                // Assert as any because the SDK is wrong. No payload is required.
                {} as any
              )
            );

          if (result?.status !== "COMPLETED") {
            return "orderNotCompleted";
          }

          const purchase = result.purchase_units[0];
          const capture = purchase?.payments.captures[0];
          if (!purchase || !capture) {
            logger.warn(
              `No payment capture found for order ${orderID} (account ${accountId}). Will not reward user.`
            );
            return "noPaymentsReceived";
          }

          const success = await rewardUserWithCredits(
            db,
            +capture.amount.value,
            accountId,
            settings.getSettings()
          );

          if (success) {
            return "creditsAwarded";
          }

          logger.error(
            `Failed to update credits for user ${accountId}. Refunding user.`
          );

          const { result: refund }: { result?: paypal.payments.Capture } =
            await client.execute(
              new paypal.payments.CapturesRefundRequest(capture.id).requestBody(
                {
                  amount: capture.amount,
                  invoice_id: capture.invoice_id,
                  note_to_payer:
                    "Refunding because credits could not be updated.",
                }
              )
            );

          if (refund?.status === "COMPLETED") {
            return "refundDueToInternalError";
          }

          logger.error(
            `Failed to refund user ${accountId} for order ${orderID}`,
            refund
          );
          return "internalErrorAndRefundFailed";
        }
      ),
  });
}

function createPayPalClient(s: AdminSettings, env: PaypalEnvironment) {
  return new paypal.core.PayPalHttpClient(
    {
      live: new paypal.core.LiveEnvironment(
        s.public.donations.paypalClientId,
        s.internal.donations.paypalClientSecret
      ),
      sandbox: new paypal.core.SandboxEnvironment(
        s.public.donations.paypalClientId,
        s.internal.donations.paypalClientSecret
      ),
    }[env]
  );
}

const accountIdToCustomId = (id: AccountId) => id.toString();
const customIdToAccountId = (customId: string) => +customId;

export const paypalEnvironments = ["live", "sandbox"] as const;

export type PaypalEnvironment = typeof paypalEnvironments[number];
