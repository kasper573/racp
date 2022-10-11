import { createSearchProcedure, noLimitForFilter } from "../../common/search";
import { t } from "../../trpc";
import { npcFilter, npcType } from "./types";
import { NpcRepository } from "./repository";

export type NpcService = ReturnType<typeof createNpcService>;

export function createNpcService(npcs: NpcRepository) {
  return t.router({
    search: createSearchProcedure(
      npcType,
      npcFilter.type,
      npcs.getNpcs,
      (entity, payload) => npcFilter.for(payload)(entity),
      noLimitForFilter((filter) => filter?.mapId?.matcher === "equals")
    ),
  });
}
