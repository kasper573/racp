import { NpcDriver } from "../../rathena/NpcDriver";
import { warpType } from "./types";

export type NpcRepository = ReturnType<typeof createNpcRepository>;

export function createNpcRepository(npc: NpcDriver) {
  return {
    warps: npc.resolve("scripts_warps.conf", warpType),
  };
}
