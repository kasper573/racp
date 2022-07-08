import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { createSearchTypes } from "../search/types";
import { monsterFilterType, monsterSpawnType, monsterType } from "./types";

const tag = createTagFactory("Monster");

export const monsterDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query(
        "searchMonsters",
        ...createSearchTypes(monsterType, monsterFilterType)
      )
      .query("getMonsterSpawns", zod.number(), zod.array(monsterSpawnType)),
});
