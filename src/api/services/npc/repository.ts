import { ResourceFactory } from "../../resources";
import { npcType } from "./types";

export type NpcRepository = ReturnType<typeof createNpcRepository>;

export function createNpcRepository(resources: ResourceFactory) {
  const npcs = resources.script(npcType);
  return {
    getNpcs: () => npcs.read(),
  };
}
