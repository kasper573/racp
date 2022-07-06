import knex from "knex";
import { singletons } from "../../lib/singletons";
import { ConfigDriver } from "./ConfigDriver";
import { Tables } from "./DatabaseDriver.types";

export type DatabaseDriver = ReturnType<typeof createDatabaseDriver>;

/**
 * Typesafe knex interface with rAthena mysql database.
 * Each property is a driver for the database of the same name.
 * The drivers are initialized lazily on first use.
 */
export function createDatabaseDriver(cfg: ConfigDriver) {
  return singletons({
    login: () => driverForDB(cfg, "login_server"),
    ipban: () => driverForDB(cfg, "ipban_server"),
    map: () => driverForDB(cfg, "map_server"),
    char: () => driverForDB(cfg, "char_server"),
  });
}

function driverForDB(cfg: ConfigDriver, dbPrefix: string) {
  const db = knex({
    client: "mysql",
    connection: () => cfg.presets.dbInfo(dbPrefix),
  });
  return {
    table: <TableName extends keyof Tables>(tableName: TableName) => {
      type Entity = Tables[TableName];
      return db<Entity, Entity[]>(tableName);
    },
  };
}
