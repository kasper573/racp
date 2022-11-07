import { zodJsonProtocol } from "../../../lib/zod/zodJsonProtocol";
import { FileRepository } from "../../../lib/repo/FileRepository";
import { Logger } from "../../../lib/logger";
import { adminSettingsType } from "./types";
import { defaultAdminSettings } from "./defaults";

export type AdminSettingsRepository = ReturnType<
  typeof createAdminSettingsRepository
>;

export function createAdminSettingsRepository({
  dataFolder,
  logger,
}: {
  dataFolder: string;
  logger: Logger;
}) {
  return new FileRepository({
    logger,
    directory: dataFolder,
    relativeFilename: "settings.json",
    protocol: zodJsonProtocol(adminSettingsType),
    defaultValue: defaultAdminSettings,
  });
}
