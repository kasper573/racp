import { t } from "../../trpc";
import { createSearchProcedure } from "../../common/search";
import { createSearchTypes } from "../../common/search.types";
import { SkillRepository } from "./repository";
import { skillFilter, skillType } from "./types";

export type SkillService = ReturnType<typeof createSkillService>;

export function createSkillService(skills: SkillRepository) {
  return t.router({
    search: createSearchProcedure(
      skillSearchTypes.query,
      skillSearchTypes.result,
      async () => Array.from((await skills).values()),
      (entity, payload) => skillFilter.for(payload)(entity)
    ),
  });
}

const skillSearchTypes = createSearchTypes(skillType, skillFilter.type);
