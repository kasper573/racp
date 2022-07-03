import knex from "knex";
import { LoginEntity } from "./radb.types";
import { RACFG } from "./racfg";

/**
 * rAthena mysql database driver
 */
export type RADB = ReturnType<typeof createRADB>;

export function createRADB(cfg: RACFG) {
  type TR = {
    login: LoginEntity;
  };

  return knex<TR>({
    client: "mysql",
    connection: () => cfg.presets.dbInfo("login_server"),
  });
}
