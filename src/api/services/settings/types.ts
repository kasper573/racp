import * as zod from "zod";

export const adminPublicSettingsType = zod.object({});
export const adminInternalSettingsType = zod.object({});
export const adminSettingsType = zod.object({
  public: adminPublicSettingsType,
  internal: adminInternalSettingsType,
});
