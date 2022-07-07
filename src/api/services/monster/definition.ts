import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { createSearchTypes } from "../search/types";
import { monsterFilterType, monsterSpawnType } from "./types";

const tag = createTagFactory("Monster");

export const monsterDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder.query(
      "searchMonsterSpawns",
      ...createSearchTypes(monsterSpawnType, monsterFilterType)
    ),
});
