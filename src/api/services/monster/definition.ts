import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { createSearchTypes } from "../search/types";
import { matcher } from "../../util/matcher";
import { createEntityFilter } from "../../../lib/zod/ZodMatcher";
import { monsterSpawnType, monsterType } from "./types";

const tag = createTagFactory("Monster");

export const monsterFilter = createEntityFilter(matcher, monsterType);

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
