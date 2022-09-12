import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { createSearchTypes } from "../../common/search";
import { UserAccessLevel } from "../auth/types";
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
      )
      .fileUpload(
        "uploadMonsterImages",
        zod.object({ success: zod.number(), failed: zod.number() }),
        { auth: UserAccessLevel.Admin }
      ),
});
