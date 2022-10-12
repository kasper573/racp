import * as zod from "zod";
import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";

export type DonationService = ReturnType<typeof createDonationService>;

export function createDonationService() {
  return t.router({
    handleIPN: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(zod.any())
      .mutation(({ input }) => {
        console.log("Handling IPN", input);
      }),
  });
}
