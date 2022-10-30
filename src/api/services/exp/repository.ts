import { ResourceFactory } from "../../resources";
import { expConfigType } from "./types";

export type ExpRepository = ReturnType<typeof createExpRepository>;

export function createExpRepository(resources: ResourceFactory) {
  return resources
    .config({ configName: "battle/exp.conf" })
    .and(resources.config({ configName: "import/battle_conf.txt" }))
    .map("exp", (configs) => {
      const {
        base_exp_rate,
        job_exp_rate,
        mvp_exp_rate,
        quest_exp_rate,
        max_exp_gain_rate,
        death_penalty_base,
        death_penalty_job,
        ...alreadyValidProps
      } = expConfigType.parse(Object.assign({}, ...configs));

      // rAthena uses different units for these values.
      // Here we normalize them to all be ratios.
      const normalized = {
        base_exp_rate: base_exp_rate / 100,
        job_exp_rate: job_exp_rate / 100,
        mvp_exp_rate: mvp_exp_rate / 100,
        quest_exp_rate: quest_exp_rate / 100,
        max_exp_gain_rate: max_exp_gain_rate / 10,
        death_penalty_base: death_penalty_base / 100 / 100,
        death_penalty_job: death_penalty_job / 100 / 100,
      };
      return {
        ...normalized,
        ...alreadyValidProps,
      };
    });
}
