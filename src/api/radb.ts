import knex from "knex";
import { RAConfigSystem } from "../lib/rathena/RAConfigSystem";
import { Tables } from "./radb.types";

export type RADatabaseDriver = ReturnType<typeof createRADatabaseDriver>;

/**
 * Typesafe knex interface with rAthena mysql database
 */
export function createRADatabaseDriver(cfg: RAConfigSystem) {
  const db = knex({
    client: "mysql",
    connection: () => cfg.presets.dbInfo("login_server"),
  });
  return <TableName extends keyof Tables>(tableName: TableName) => {
    type Entity = Tables[TableName];
    return db<Entity, Entity[]>(tableName);
  };
}
