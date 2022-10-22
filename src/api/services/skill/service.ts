import { t } from "../../trpc";

import { SkillRepository } from "./repository";

export type SkillService = ReturnType<typeof createSkillService>;

export function createSkillService({ repo }: { repo: SkillRepository }) {
  return t.router({});
}
