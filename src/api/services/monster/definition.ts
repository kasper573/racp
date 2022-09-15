import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { createSearchTypes } from "../../common/search";
import { UserAccessLevel } from "../user/types";
import {
  monsterFilter,
  monsterSpawnFilter,
  monsterSpawnType,
  monsterType,
} from "./types";

const monsterTag = createTagFactory("Monster");
const monsterImageTag = createTagFactory("MonsterImage");

export const monsterDefinition = createRpcDefinition({
  tagTypes: [monsterTag.type, monsterImageTag.type],
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
        {
          auth: UserAccessLevel.Admin,
          tags: [...monsterImageTag.many(), ...monsterTag.many()],
        }
      )
      .query(
        "getMonstersMissingImages",
        zod.void(),
        zod.array(monsterType.shape["Id"]),
        {
          tags: monsterImageTag.many(),
        }
      ),
});
