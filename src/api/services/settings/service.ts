import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { adminPublicSettingsType, adminSettingsType } from "./types";
import { AdminSettingsRepository } from "./repository";

export type AdminSettingsService = ReturnType<
  typeof createAdminSettingsService
>;

export function createAdminSettingsService(settings: AdminSettingsRepository) {
  return t.router({
    readPublic: t.procedure
      .output(adminPublicSettingsType)
      .query(() => settings.getSettings().public),
    read: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(adminSettingsType)
      .query(settings.getSettings),
    update: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(adminSettingsType)
      .mutation(({ input }) => settings.updateSettings(input)),
  });
}
