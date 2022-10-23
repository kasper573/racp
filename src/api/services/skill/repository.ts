import { ResourceFactory } from "../../resources";
import { skillType } from "./types";

export type SkillRepository = ReturnType<typeof createSkillRepository>;

export function createSkillRepository(resources: ResourceFactory) {
  return resources.yaml("db/skill_db.yml", {
    entityType: skillType,
    getKey: (skill) => skill.Id,
  });
}
