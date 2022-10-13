import { DatabaseDriver } from "../../../rathena/DatabaseDriver";
import { AdminSettings } from "../../settings/types";
import { calculateRewardedCredits } from "./calculateRewardedCredits";

export async function rewardUserWithCredits(
  db: DatabaseDriver,
  donationAmount: number,
  accountId: number,
  settings: AdminSettings
) {
  const rewardedCredits = calculateRewardedCredits(
    donationAmount,
    settings.public.donations.exchangeRate
  );

  try {
    const baseQuery = db.char.table("acc_reg_num");
    const baseEntry = {
      account_id: accountId,
      key: settings.internal.donations.accRegNumKey,
    };

    const existing = await baseQuery
      .clone()
      .where(baseEntry)
      .clone()
      .select("value")
      .first();

    let success: boolean;
    if (existing) {
      const updatedCredits = (existing ? +existing.value : 0) + rewardedCredits;
      const affectedRows = await baseQuery
        .clone()
        .where(baseEntry)
        .update({ value: updatedCredits.toString() });
      success = affectedRows > 0;
    } else {
      const newIds = await baseQuery
        .clone()
        .insert({ ...baseEntry, value: rewardedCredits.toString() });
      success = newIds.length > 0;
    }
    return success;
  } catch (e) {
    return false;
  }
}
