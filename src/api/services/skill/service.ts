import { t } from "../../trpc";
import { createSearchProcedure } from "../../common/search";
import { SkillRepository } from "./repository";
import { skillFilter, skillSearchTypes } from "./types";

export type SkillService = ReturnType<typeof createSkillService>;

export function createSkillService(skills: SkillRepository) {
  return t.router({
    search: createSearchProcedure(
      skillSearchTypes,
      async () => Array.from((await skills).values()),
      (entity, payload) => skillFilter.for(payload)(entity)
    ),
  });
}
