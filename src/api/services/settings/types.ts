import * as zod from "zod";
import { ZodType } from "zod";
import { conditionallyRequired } from "../../../lib/zod/conditionallyRequired";
import { huntLimitsType } from "../hunt/types";
import { rpcFile } from "../../common/RpcFile";

export type Currency = NominalString<"Currency">;
export const currencyType = zod.string() as ZodType<Currency>;

export type Money = zod.infer<typeof moneyType>;
export const moneyType = zod.object({
  value: zod.number(),
  currency: currencyType,
});

export type PaypalSettings = zod.infer<typeof paypalSettingsType>;
export const paypalSettingsType = zod.object({
  merchantId: zod.string(),
  clientId: zod.string(),
  clientSecret: zod.string(),
});

const donationSettingsBaseType = zod.object({
  enabled: zod.boolean(),
  defaultAmount: zod.number(),
  exchangeRate: zod.number(),
  currency: currencyType,
  presentation: zod.string(),
  accRegNumKey: zod.string(),
  paypal: paypalSettingsType,
});

export const donationSettingsType = conditionallyRequired(
  donationSettingsBaseType,
  ({ enabled }) => enabled,
  ["paypal.merchantId", "paypal.clientId", "paypal.clientSecret"],
  "Required when donations are enabled"
);

export const rAthenaModeType = zod.enum(["Renewal", "Prerenewal"]);

export type RAthenaMode = zod.infer<typeof rAthenaModeType>;

export type AdminSettings = zod.infer<typeof adminSettingsType>;
export const adminSettingsType = zod.object({
  rAthenaMode: rAthenaModeType,
  pageTitle: zod.string(),
  homePageBanner: rpcFile.optional(),
  homePageBannerUrl: zod.string().optional(),
  homePageBannerTitle: zod.string().optional(),
  homePageContent: zod.string(),
  donations: donationSettingsType,
  huntLimits: huntLimitsType,
  mainMenuLinks: zod.record(zod.string().url()),
});

export type AdminPublicSettings = zod.infer<typeof adminPublicSettingsType>;
export const adminPublicSettingsType = zod.object({
  ...adminSettingsType.omit({ homePageBanner: true }).shape,
  donations: zod.object({
    ...donationSettingsBaseType.shape,
    paypal: paypalSettingsType.omit({ clientSecret: true }),
  }),
});
