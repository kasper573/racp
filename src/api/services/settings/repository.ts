import { zodJsonProtocol } from "../../../lib/zod/zodJsonProtocol";
import { FileRepository } from "../../../lib/repo/FileRepository";
import { Logger } from "../../../lib/logger";
import { ImageRepository } from "../../common/ImageRepository";
import { RpcFile } from "../../common/RpcFile";
import { AdminSettings, adminSettingsType } from "./types";
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
  class AdminSettingsRepository extends FileRepository<
    AdminSettings,
    AdminSettings
  > {
    images?: ImageRepository;

    constructor() {
      super({
        logger,
        directory: dataFolder,
        relativeFilename: "settings.json",
        protocol: zodJsonProtocol(adminSettingsType),
        defaultValue: defaultAdminSettings,
      });
    }

    private async uploadImage(file?: RpcFile) {
      if (this.images && file) {
        const [name] = await this.images.update([file]);
        const urlMap = await this.images.read();
        return urlMap[name];
      }
    }

    protected async writeImpl(data: AdminSettings) {
      data.homePageBannerUrl = await this.uploadImage(data.homePageBanner);
      await super.writeImpl(data);
    }
  }
  return new AdminSettingsRepository();
}
