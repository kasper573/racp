import { createRpcController } from "../../../lib/rpc/createRpcController";
import { createSearchController } from "../search/controller";
import { NpcRepository } from "./repository";
import { warpFilter } from "./types";
import { npcDefinition } from "./definition";

export async function npcController(npcs: NpcRepository) {
  return createRpcController(npcDefinition.entries, {
    searchWarps: createSearchController(
      () => npcs.warps,
      (entity, payload) => warpFilter.for(payload)(entity)
    ),
  });
}
