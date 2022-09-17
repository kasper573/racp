import * as fs from "fs";
import * as path from "path";
import { pick } from "lodash";
import * as mysql from "mysql";
import { createLogger, Logger } from "../src/lib/logger";
import { readCliArgs } from "../src/api/util/cli";
import { options } from "../src/api/options";
import { createConfigDriver } from "../src/api/rathena/ConfigDriver";
import { createDatabaseDriver } from "../src/api/rathena/DatabaseDriver";
import { createYamlDriver } from "../src/api/rathena/YamlDriver";
import { createUserRepository } from "../src/api/services/user/repository";

/**
 * Updates a clean rathena build with the settings we need to run racp + rathena in CI.
 */
async function configureRAthena() {
  let exitCode = 0;

  const logger = createLogger(console.log).chain("configureRAthena");
  const args = readCliArgs({
    ...pick(options, "rAthenaPath", "adminPermissionName", "rAthenaMode"),
    MYSQL_HOST: { type: "string", required: true },
    MYSQL_PORT: { type: "number", required: true },
    MYSQL_USER: { type: "string", required: true },
    MYSQL_PASSWORD: { type: "string", required: true },
    MYSQL_DATABASE: { type: "string", required: true },
    ADMIN_USER: { type: "string", required: true },
    ADMIN_PASSWORD: { type: "string", required: true },
  });

  logger.log("args", JSON.stringify(args));

  const yaml = createYamlDriver({ ...args, logger });
  const cfg = createConfigDriver({ ...args, logger });
  const user = createUserRepository({ ...args, yaml });

  logger.log(`Updating ${cfg.presets.dbInfoConfigName}...`);
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

  const newAccountIds = await db.login.table("login").insert({
    userid: args.ADMIN_USER,
    user_pass: args.ADMIN_PASSWORD,
    email: "admin@localhost",
    group_id: (await user.adminGroupIds)[0],
  });

  if (!newAccountIds.length) {
    logger.error("Failed to create admin account");
    exitCode = 1;
  }

  conn.destroy();
  await db.destroy();
  logger.log("Finished configuring RAthena");
  process.exit(1);
}

async function runSqlFile(
  conn: mysql.Connection,
  logger: Logger,
  file: string
) {
  const sql = await fs.promises.readFile(file, "utf-8");

  try {
    logger.log(`Executing SQL: ${file}...`);
    await runQuery(conn, sql);
  } catch (e) {
    logger.error(`Error while running sql file "${file}": ${e}`);
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
