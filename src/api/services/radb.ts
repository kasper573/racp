import knex from "knex";
import { Tables } from "./radb.types";
import { RACFG } from "./racfg";

/**
 * rAthena mysql database driver
 */
export type RADB = ReturnType<typeof createRADB>;

export function createRADB(cfg: RACFG) {
  const db = knex({
    client: "mysql",
    connection: () => cfg.presets.dbInfo("login_server"),
  });
  return <TableName extends keyof Tables>(tableName: TableName) => {
    type Entity = Tables[TableName];
    return db<Entity, Entity[]>(tableName);
  };
}
