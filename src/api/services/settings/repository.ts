import { zodJsonProtocol } from "../../../lib/zod/zodJsonProtocol";
import { ResourceFactory } from "../../resources";
import { adminSettingsType } from "./types";
import { defaultAdminSettings } from "./defaults";

export type AdminSettingsRepository = ReturnType<
  typeof createAdminSettingsRepository
>;

export function createAdminSettingsRepository(resources: ResourceFactory) {
  return resources.file({
    relativeFilename: "settings.json",
    protocol: zodJsonProtocol(adminSettingsType),
    defaultValue: defaultAdminSettings,
  });
}
