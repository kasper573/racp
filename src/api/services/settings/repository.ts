import { FileStore } from "../../../lib/fs/createFileStore";
import { zodJsonProtocol } from "../../../lib/zod/zodJsonProtocol";
import { adminSettingsType } from "./types";
import { defaultAdminSettings } from "./defaults";

export type AdminSettingsRepository = ReturnType<
  typeof createAdminSettingsRepository
>;

export function createAdminSettingsRepository(files: FileStore) {
  const settingsFile = files.entry(
    "settings.json",
    zodJsonProtocol(adminSettingsType)
  );
  return {
    getSettings: () => settingsFile.data ?? defaultAdminSettings,
    updateSettings: settingsFile.write,
  };
}
