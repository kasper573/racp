import knex, { Knex } from "knex";
import * as mysql from "mysql";
import { singletons } from "../../lib/singletons";
import { ConfigDriver, dbInfoConfigName } from "./ConfigDriver";
import { Tables } from "./DatabaseDriver.types";

export type DatabaseDriver = ReturnType<typeof createDatabaseDriver>;

/**
 * Typesafe knex interface with rAthena mysql database.
 * Each property is a driver for the database of the same name.
 * The drivers are initialized lazily on first use.
 */
export function createDatabaseDriver(cfg: ConfigDriver) {
  const db = singletons({
    login: () => driverForDB(cfg, "login_server"),
    map: () => driverForDB(cfg, "map_server"),
    char: () => driverForDB(cfg, "char_server"),
    destroy: () => destroy,
  });

  function destroy() {
    return Promise.all(
      Object.values(drivers).map((driver) => driver.destroy())
    );
  }

  const drivers: Record<string, Knex> = {};

  const dbInfoConfig = cfg.load(dbInfoConfigName);

  function driverForDB(cfg: ConfigDriver, dbPrefix: string) {
    const dbInfo = dbInfoConfig.then((config) =>
      cfg.presets.createDBInfo(config, dbPrefix)
    );

    const driver = knex({
      client: "mysql",
      connection: () => dbInfo,
    });

    drivers[dbPrefix] = driver;

    return {
      dbInfo,
      name: dbPrefix,
      table: <TableName extends keyof Tables>(tableName: TableName) => {
        type Entity = Tables[TableName];
        return driver<Entity, Entity[]>(tableName);
      },
      async useConnection(use: (conn: mysql.Connection) => Promise<void>) {
        const info = await dbInfo;
        const conn = mysql.createConnection({
          ...info,
          multipleStatements: true,
        });
        await use(conn);
        conn.destroy();
      },
    };
  }

  return db;
}
