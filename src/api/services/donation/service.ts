import * as zod from "zod";
import * as paypal from "@paypal/checkout-server-sdk";
import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { AccountId, UserAccessLevel } from "../user/types";
import { Logger } from "../../../lib/logger";
import { AdminSettingsRepository } from "../settings/repository";
import { DatabaseDriver } from "../../rathena/DatabaseDriver";
import {
  AdminSettings,
  Currency,
  currencyType,
  moneyType,
} from "../settings/types";
import { AccRegNumDriver } from "../../rathena/AccRegDriver";
import {
  donationCaptureResultType,
  DonationEnvironment,
  donationEnvironmentType,
} from "./types";
import { calculateRewardedCredits } from "./utils/calculateRewardedCredits";
import { paypalCurrencies } from "./paypalCurrencies";
import { createFakePayPalClient } from "./createFakePayPalClient";

export type DonationService = ReturnType<typeof createDonationService>;

export function createDonationService({
  db,
  env,
  settings,
  logger,
}: {
  db: DatabaseDriver;
  env: DonationEnvironment;
  settings: AdminSettingsRepository;
  logger: Logger;
}) {
  const creditBalanceAtom = new AccRegNumDriver(db).createKeyAtom(
    () => settings.getSettings().internal.donations.accRegNumKey
  );

  return t.router({
    environment: t.procedure.output(donationEnvironmentType).query(() => env),
    currencies: t.procedure
      .output(zod.array(currencyType))
      .query(() => paypalCurrencies as Currency[]),
    balance: t.procedure
      .output(zod.number())
      .query(({ ctx: { auth } }) =>
        auth
          ? creditBalanceAtom.read(auth.id).then((balance) => balance ?? 0)
          : 0
      ),
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

          const rewardedCredits = calculateRewardedCredits(
            +capture.amount.value,
            settings.getSettings().public.donations.exchangeRate
          );

          const success = await creditBalanceAtom.write(
            accountId,
            (n = 0) => n + rewardedCredits
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

const fakePayPalDB: paypal.orders.Order[] = [];
function createPayPalClient(s: AdminSettings, env: DonationEnvironment) {
  if (env === "fake") {
    return createFakePayPalClient(fakePayPalDB);
  }
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
