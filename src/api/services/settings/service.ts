import * as zod from "zod";
import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { FileStore } from "../../../lib/fs/createFileStore";
import { zodJsonProtocol } from "../../../lib/zod/zodJsonProtocol";
import {
  adminPublicSettingsType,
  adminSettingsType,
  Currency,
  currencyType,
} from "./types";
import { defaultAdminSettings } from "./defaults";

export type AdminSettingsService = ReturnType<
  typeof createAdminSettingsService
>;

export function createAdminSettingsService(files: FileStore) {
  const settingsFile = files.entry(
    "settings.json",
    zodJsonProtocol(adminSettingsType)
  );
  const getSettings = () => settingsFile.data ?? defaultAdminSettings;
  return t.router({
    readPublic: t.procedure
      .output(adminPublicSettingsType)
      .query(() => getSettings().public),
    read: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(adminSettingsType)
      .query(getSettings),
    update: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(adminSettingsType)
      .mutation(({ input }) => settingsFile.write(input)),
    getCurrencies: t.procedure
      .output(zod.array(currencyType))
      .query(() => ["USD" as Currency, "EUR" as Currency]),
  });
}