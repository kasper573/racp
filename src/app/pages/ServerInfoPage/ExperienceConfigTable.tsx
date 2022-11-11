import { ExpConfig } from "../../../api/services/exp/types";
import { KVTable } from "../../components/KVTable";
import { Percentage } from "../../components/Percentage";
import { Zeny } from "../../components/Zeny";

export function ExperienceConfigTable({ config }: { config: ExpConfig }) {
  return (
    <KVTable
      rows={{
        "Base rate": <Percentage value={config.base_exp_rate} />,
        "Job rate": <Percentage value={config.job_exp_rate} />,
        "Mvp rate": <Percentage value={config.mvp_exp_rate} />,
        "Quest rate": <Percentage value={config.quest_exp_rate} />,
        "Max experience gained per kill": config.max_exp_gain_rate ? (
          <Percentage value={config.max_exp_gain_rate} colorize={false} />
        ) : (
          "Unlimited"
        ),
        "Max levels gained per kill": config.multi_level_up ? (
          <>
            Base{" "}
            {config.multi_level_up_base
              ? config.multi_level_up_base
              : "Unlimited"}
            , Job{" "}
            {config.multi_level_up_job
              ? config.multi_level_up_job
              : "Unlimited"}
          </>
        ) : (
          1
        ),
        "Death experience penalty": (
          <>
            Base{" "}
            <Percentage value={config.death_penalty_base} colorize={false} />,
            Job <Percentage value={config.death_penalty_job} colorize={false} />
          </>
        ),
        "Death zeny penalty": <Zeny value={config.zeny_penalty} />,
      }}
    />
  );
}
