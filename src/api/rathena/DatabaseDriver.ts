import knex, { Knex } from "knex";
import * as mysql from "mysql";
import { singletons } from "../../lib/singletons";
import { Tables } from "./DatabaseDriver.types";
import { DBInfoDriver } from "./DBInfoDriver";
import { createConfigDriver } from "./ConfigDriver";

export type DatabaseDriver = ReturnType<typeof createDatabaseDriver>;

export const dbInfoConfigName = "inter_athena.conf";

/**
 * Typesafe knex interface with rAthena mysql database.
 * Each property is a driver for the database of the same name.
 * The drivers are initialized lazily on first use.
 */
export function createDatabaseDriver(
  ...params: Parameters<typeof createConfigDriver>
) {
  // Automatically creating config/dbInfo drivers since nothing else is using them
  // If we need to use them for something else, we can refactor this
  const cfg = createConfigDriver(...params);
  const dbInfoDriver = new DBInfoDriver(cfg.resolve(dbInfoConfigName));

  const db = singletons({
    login: () => driverForDB("login_server"),
    map: () => driverForDB("map_server"),
    char: () => driverForDB("char_server"),
    log: () => driverForDB("log_db"),
    destroy: () => destroy,
    all: (): DBDriver[] => [db.login, db.map, db.char, db.log],
    info: () => dbInfoDriver,
  });

  function destroy() {
    return Promise.all(
      Object.values(drivers).map((driver) => driver.destroy())
    );
  }

  const drivers: Record<string, Knex> = {};

  type DBDriver = ReturnType<typeof driverForDB>;
  function driverForDB(dbPrefix: string) {
    const getDBInfo = () => dbInfoDriver.read(dbPrefix);
    const driver = knex({
      client: "mysql",
      connection: getDBInfo,
    });

    drivers[dbPrefix] = driver;

    return {
      dbInfo: getDBInfo,
      name: dbPrefix,
      table: <TableName extends keyof Tables>(tableName: TableName) => {
        type Entity = Tables[TableName];
        return driver<Entity, Entity[]>(tableName);
      },
      async useConnection(use: (conn: mysql.Connection) => Promise<void>) {
        const info = await getDBInfo();
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
