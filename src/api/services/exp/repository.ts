import { ResourceFactory } from "../../resources";
import { expConfigType } from "./types";

export type ExpRepository = ReturnType<typeof createExpRepository>;

export function createExpRepository(resources: ResourceFactory) {
  return resources
    .config({ configName: "battle/exp.conf" })
    .and(resources.config({ configName: "import/battle_conf.txt" }))
    .map("exp", (configs) =>
      expConfigType.parse(Object.assign({}, ...configs))
    );
}
