import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { createSearchTypes } from "../search/types";
import { monsterFilter, monsterSpawnType, monsterType } from "./types";

const tag = createTagFactory("Monster");

export const monsterDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query(
        "searchMonsters",
        ...createSearchTypes(monsterType, monsterFilter.type)
      )
      .query("getMonsterSpawns", zod.number(), zod.array(monsterSpawnType)),
});
