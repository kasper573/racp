import { zodJsonProtocol } from "../../../lib/zod/zodJsonProtocol";
import { ResourceFactory } from "../../resources";
import { AdminSettings, adminSettingsType } from "./types";
import { defaultAdminSettings } from "./defaults";

export type AdminSettingsRepository = ReturnType<
  typeof createAdminSettingsRepository
>;

export function createAdminSettingsRepository(resources: ResourceFactory) {
  const settingsFile = resources.file<AdminSettings, true>({
    relativeFilename: "settings.json",
    protocol: zodJsonProtocol(adminSettingsType),
    defaultValue: defaultAdminSettings,
  });
  return {
    getSettings: () => settingsFile.read(),
    updateSettings: settingsFile.write,
  };
}
