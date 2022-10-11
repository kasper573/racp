import { Logger } from "../../../lib/logger";
import { NpcDriver } from "../../rathena/NpcDriver";
import { npcType } from "./types";

export type NpcRepository = ReturnType<typeof createNpcRepository>;

export function createNpcRepository({
  npc,
  logger,
}: {
  npc: NpcDriver;
  logger: Logger;
}) {
  const npcObjectsPromise = logger.track(
    npc.resolve(npcType),
    "npc.resolve",
    "npc"
  );

  return {
    getNpcs: () => npcObjectsPromise,
  };
}
