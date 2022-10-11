import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { adminPublicSettingsType, adminSettingsType } from "./types";

export type AdminSettingsService = ReturnType<
  typeof createAdminSettingsService
>;

export function createAdminSettingsService() {
  return t.router({
    readPublic: t.procedure.output(adminPublicSettingsType).query(async () => {
      return {};
    }),
    read: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(adminSettingsType)
      .query(async () => {
        return { public: {}, internal: {} };
      }),
    update: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(adminSettingsType)
      .mutation(async ({ input }) => {}),
  });
}
