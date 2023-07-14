import { z } from "zod";
import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { zodJsonProtocol } from "../../../lib/zod/zodJsonProtocol";
import { ResourceFactory } from "../../resources";
import { adminPublicSettingsType, adminSettingsType } from "./types";
import { AdminSettingsRepository } from "./repository";

export type AdminSettingsService = ReturnType<
  typeof createAdminSettingsService
>;

export function createAdminSettingsService(
  settings: AdminSettingsRepository,
  resources: ResourceFactory
) {
  const backup = resources.file({
    relativeFilename: "settings_backup.json",
    protocol: zodJsonProtocol(z.string()),
  });
  settings.events.on("loadParseError", (content) => backup.write(content));
  settings.events.on("loadSuccess", () => backup.write(undefined));
  settings.events.on("write", () => backup.write(undefined));
  return t.router({
    readPublic: t.procedure
      .output(adminPublicSettingsType)
      .query(settings.read),
    read: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(adminSettingsType)
      .query(settings.read),
    readBackup: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(z.string().nullable())
      .query(async () => (await backup.read()) ?? null),
    update: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(adminSettingsType)
      .mutation(({ input }) => settings.write(input)),
  });
}
