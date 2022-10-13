import * as zod from "zod";
import { zodNumeric } from "../../../lib/zod/zodNumeric";
import { currencyType } from "../settings/types";
import { accountIdType } from "../user/types";

export type DonationIPN = zod.infer<typeof donationIPNType>;
export const donationIPNType = zod.object({
  mc_gross: zodNumeric(),
  mc_currency: currencyType,
  payment_status: zod.string(),
  custom: zod
    .string()
    .transform((s) => donationMetaDataType.parse(JSON.parse(s))),
});

export type DonationMetaData = zod.infer<typeof donationMetaDataType>;
export const donationMetaDataType = zod.object({
  accountId: accountIdType,
});
