import { Logger } from "../../../lib/logger";
import { ScriptDriver } from "../../rathena/ScriptDriver";
import { npcType } from "./types";

export type NpcRepository = ReturnType<typeof createNpcRepository>;

export function createNpcRepository({
  script,
  logger,
}: {
  script: ScriptDriver;
  logger: Logger;
}) {
  const npcObjectsPromise = logger.track(
    script.resolve(npcType),
    "script.resolve",
    "npc"
  );

  return {
    getNpcs: () => npcObjectsPromise,
  };
}
