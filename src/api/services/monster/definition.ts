import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { createSearchTypes } from "../../common/search";
import {
  monsterFilter,
  monsterSpawnFilter,
  monsterSpawnType,
  monsterType,
} from "./types";

const tag = createTagFactory("Monster");

export const monsterDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query(
        "searchMonsters",
        ...createSearchTypes(monsterType, monsterFilter.type)
      )
      .query(
        "searchMonsterSpawns",
        ...createSearchTypes(monsterSpawnType, monsterSpawnFilter.type)
      ),
});
