import * as zod from "zod";
import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";
import { RAthenaDatabaseDriver } from "../../rathena/RAthenaDatabaseDriver";
import { Character, characterType } from "./types";

export type CharacterService = ReturnType<typeof createCharacterService>;

export function createCharacterService(radb: RAthenaDatabaseDriver) {
  return t.router({
    mine: t.procedure
      .use(access(UserAccessLevel.User))
      .output(zod.array(characterType))
      .query(async ({ ctx: { auth } }) => {
        const result = await radb.char
          .table("char")
          .select("name", "char_id", "class", "zeny", "base_level", "job_level")
          .where("account_id", "=", auth.id);
        return result.map(
          (res): Character => ({
            name: res.name,
            id: res.char_id,
            job: String(res.class),
            zeny: res.zeny,
            baseLevel: res.base_level,
            jobLevel: res.job_level,
          })
        );
      }),
  });
}
