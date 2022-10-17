import { zodJsonProtocol } from "../../../lib/zod/zodJsonProtocol";
import { ResourceFactory } from "../../resources";
import { adminSettingsType } from "./types";
import { defaultAdminSettings } from "./defaults";

export type AdminSettingsRepository = ReturnType<
  typeof createAdminSettingsRepository
>;

export function createAdminSettingsRepository(resources: ResourceFactory) {
  const settingsFile = resources.file(
    "settings.json",
    zodJsonProtocol(adminSettingsType)
  );
  return {
    getSettings: () =>
      settingsFile.read().then((settings) => settings ?? defaultAdminSettings),
    updateSettings: settingsFile.write,
  };
}
