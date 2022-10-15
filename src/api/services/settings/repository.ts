import { FileStore } from "../../../lib/fs/createFileStore";
import { zodJsonProtocol } from "../../../lib/zod/zodJsonProtocol";
import { adminSettingsType } from "./types";
import { defaultAdminSettings } from "./defaults";

export type AdminSettingsRepository = ReturnType<
  typeof createAdminSettingsRepository
>;

export function createAdminSettingsRepository(files: FileStore) {
  const settingsFile = files.entry({
    relativeFilename: "settings.json",
    protocol: zodJsonProtocol(adminSettingsType),
  });
  return {
    getSettings: () =>
      settingsFile.read().then((settings) => settings ?? defaultAdminSettings),
    updateSettings: settingsFile.write,
  };
}
