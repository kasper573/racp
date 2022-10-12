import * as zod from "zod";

export type ZenyColor = zod.infer<typeof zenyColorType>;
export const zenyColorType = zod.tuple([zod.number(), zod.string()]);

export type AdminPublicSettings = zod.infer<typeof adminPublicSettingsType>;
export const adminPublicSettingsType = zod.object({
  pageTitle: zod.string(),
  zenyColors: zod.object({
    // One for each theme mode
    dark: zod.array(zenyColorType),
    light: zod.array(zenyColorType),
  }),
  donations: zod.object({
    enabled: zod.boolean(),
    presentation: zod.string(),
  }),
});

export type AdminInternalSettings = zod.infer<typeof adminInternalSettingsType>;
export const adminInternalSettingsType = zod.object({
  donations: zod.object({
    accRegNumKey: zod.string(),
  }),
});

export type AdminSettings = zod.infer<typeof adminSettingsType>;
export const adminSettingsType = zod.object({
  public: adminPublicSettingsType,
  internal: adminInternalSettingsType,
});
