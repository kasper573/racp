import { createSearchProcedure, noLimitForFilter } from "../../common/search";
import { t } from "../../trpc";
import { Repository } from "../../../lib/repo/Repository";
import { createSearchTypes } from "../../common/search.types";
import { Npc, npcFilter, npcType } from "./types";

export type NpcService = ReturnType<typeof createNpcService>;

export function createNpcService(npcs: Repository<Npc[]>) {
  return t.router({
    search: createSearchProcedure(
      npcSearchTypes,
      () => npcs,
      (entity, payload) => npcFilter.for(payload)(entity),
      noLimitForFilter((filter) => filter?.mapId?.matcher === "equals")
    ),
  });
}

const npcSearchTypes = createSearchTypes(npcType, npcFilter.type);
