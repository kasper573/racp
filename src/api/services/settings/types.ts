import * as zod from "zod";
import { ZodType } from "zod";
import { conditionallyRequired } from "../../../lib/zod/conditionallyRequired";

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
  donations: donationSettingsType,
});

export type AdminPublicSettings = zod.infer<typeof adminPublicSettingsType>;
export const adminPublicSettingsType = zod.object({
  ...adminSettingsType.shape,
  donations: zod.object({
    ...donationSettingsBaseType.shape,
    paypal: paypalSettingsType.omit({ clientSecret: true }),
  }),
});
