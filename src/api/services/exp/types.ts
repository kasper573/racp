import * as zod from "zod";
import { zodNumeric } from "../../../lib/zod/zodNumeric";
import { zodFlexibleBoolean } from "../../../lib/zod/zodFlexibleBoolean";

export type ExpConfig = zod.infer<typeof expConfigType>;
export const expConfigType = zod.object({
  base_exp_rate: zodNumeric(),
  job_exp_rate: zodNumeric(),
  mvp_exp_rate: zodNumeric(),
  quest_exp_rate: zodNumeric(),
  max_exp_gain_rate: zodNumeric(),
  multi_level_up: zodFlexibleBoolean(),
  multi_level_up_base: zodNumeric(),
  multi_level_up_job: zodNumeric(),
  zeny_penalty: zodNumeric(),
  death_penalty_base: zodNumeric(),
  death_penalty_job: zodNumeric(),
});
