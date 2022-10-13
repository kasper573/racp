import * as zod from "zod";
import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { Logger } from "../../../lib/logger";
import { ipnValidationResultType } from "./createIPNRequestHandler";
import { donationIPNType } from "./types";

export type DonationService = ReturnType<typeof createDonationService>;

export function createDonationService({
  getIPNUrl,
  logger,
}: {
  getIPNUrl: () => string;
  logger: Logger;
}) {
  return t.router({
    getIPNUrl: t.procedure.output(zod.string()).query(getIPNUrl),
    handleIPN: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(ipnValidationResultType)
      .mutation(({ input: ipn }) => {
        if (!ipn.success) {
          logger.warn("Received invalid IPN request", ipn.error);
          return;
        }
        const payloadResult = donationIPNType.safeParse(ipn.params);
        if (!payloadResult.success) {
          logger.log("Ignored IPN request", ipn.params);
          return;
        }

        console.log(
          "Received IPN confirming a successful donation",
          payloadResult.data
        );
      }),
  });
}
