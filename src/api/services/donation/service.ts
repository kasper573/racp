import * as zod from "zod";
import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { Logger } from "../../../lib/logger";
import { AdminSettingsRepository } from "../settings/repository";
import { DatabaseDriver } from "../../rathena/DatabaseDriver";
import { ipnValidationResultType } from "./utils/createIPNRequestHandler";
import { donationIPNType } from "./types";
import { rewardUserWithCredits } from "./utils/rewardUserWithCredits";

export type DonationService = ReturnType<typeof createDonationService>;

export function createDonationService({
  db,
  settings,
  getIPNUrl,
  logger,
}: {
  db: DatabaseDriver;
  settings: AdminSettingsRepository;
  getIPNUrl: () => string;
  logger: Logger;
}) {
  return t.router({
    getIPNUrl: t.procedure.output(zod.string()).query(getIPNUrl),
    handleIPN: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(ipnValidationResultType)
      .mutation(async ({ input: ipn }) => {
        if (!ipn.success) {
          logger.warn("Received invalid IPN request", ipn.error);
          return;
        }

        const res = donationIPNType.safeParse(ipn.params);
        if (!res.success) {
          logger.log("Ignored IPN request", ipn.params);
          return;
        }

        const { data: donation } = res;
        if (donation.payment_status !== "Completed") {
          logger.log("Ignored incomplete donation", { donation, ipn });
          return;
        }

        console.log("Received IPN confirming a successful donation", res.data);
        const [success, credits] = await rewardUserWithCredits(
          db,
          donation,
          settings.getSettings()
        );

        if (!success) {
          logger.error(
            `Failed to update credits for user ${donation.custom.accountId}`
          );
          // TODO: Issue refund
          return;
        }

        logger.log(
          `Rewarded user ${donation.custom.accountId} with ${credits} credits`
        );
      }),
  });
}
