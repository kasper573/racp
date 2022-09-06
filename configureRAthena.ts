import * as fs from "fs";
import * as path from "path";
import { pick } from "lodash";
import * as mysql from "mysql";
import { createLogger, Logger } from "./src/lib/logger";
import { readCliArgs } from "./src/api/util/cli";
import { options } from "./src/api/options";
import { createConfigDriver } from "./src/api/rathena/ConfigDriver";
import { createUser } from "./src/api/services/auth/controller";
import { createDatabaseDriver } from "./src/api/rathena/DatabaseDriver";
import { UserAccessLevel } from "./src/api/services/auth/types";

/**
 * Updates a clean rathena build with the settings we need to run racp + rathena in docker.
 */
async function configureRAthena() {
  const args = readCliArgs({
    ...pick(options, "rAthenaPath"),
    MYSQL_HOST: { type: "string", required: true },
    MYSQL_PORT: { type: "number", required: true },
    MYSQL_USER: { type: "string", required: true },
    MYSQL_PASSWORD: { type: "string", required: true },
    MYSQL_DATABASE: { type: "string", required: true },
    ADMIN_USER: { type: "string", required: true },
    ADMIN_PASSWORD: { type: "string", required: true },
  });

  const logger = createLogger(console.log);
  const cfg = createConfigDriver({
    rAthenaPath: args.rAthenaPath,
    logger,
  });

  const dbInfo = await cfg.load(cfg.presets.dbInfoConfigName);
  dbInfo.update(
    [
      "login_server",
      "char_server",
      "ipban_db",
      "map_server",
      "web_server",
      "log_db",
    ].reduce(
      (record, prefix) => ({
        ...record,
        [`${prefix}_ip`]: args.MYSQL_HOST,
        [`${prefix}_port`]: args.MYSQL_PORT,
        [`${prefix}_id`]: args.MYSQL_USER,
        [`${prefix}_pw`]: args.MYSQL_PASSWORD,
        [`${prefix}_db`]: args.MYSQL_DATABASE,
      }),
      {}
    )
  );

  const conn = mysql.createConnection({
    host: args.MYSQL_HOST,
    port: args.MYSQL_PORT,
    database: args.MYSQL_DATABASE,
    user: args.MYSQL_USER,
    password: args.MYSQL_PASSWORD,
    multipleStatements: true,
  });

  await runSqlFile(
    conn,
    logger,
    path.resolve(args.rAthenaPath, "sql-files", "main.sql")
  );

  const db = createDatabaseDriver(cfg);

  await createUser(db, {
    username: args.ADMIN_USER,
    password: args.ADMIN_PASSWORD,
    email: "admin@localhost",
    group: UserAccessLevel.Admin,
  });

  conn.destroy();
  await db.destroy();
  console.log("Finished configuring RAthena");
}

async function runSqlFile(
  conn: mysql.Connection,
  logger: Logger,
  file: string
) {
  const sql = await fs.promises.readFile(file, "utf-8");

  try {
    await runQuery(conn, sql);
  } catch (e) {
    logger.log(`Error while running sql file "${file}": ${e}`);
  }
}

function runQuery(conn: mysql.Connection, query: string) {
  return new Promise<void>((resolve, reject) =>
    conn.query(query, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  );
}

configureRAthena();
