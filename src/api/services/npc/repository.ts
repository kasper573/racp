import { ResourceFactory } from "../../resources";
import { npcType } from "./types";

export function createNpcRepository(resources: ResourceFactory) {
  return resources.script(npcType);
}
