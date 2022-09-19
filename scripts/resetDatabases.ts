import * as path from "path";
import * as fs from "fs";
import * as mysql from "mysql";
import { pick } from "lodash";
import { createDatabaseDriver } from "../src/api/rathena/DatabaseDriver";
import { Logger } from "../src/lib/logger";
import { createUserRepository } from "../src/api/services/user/repository";
import { ConfigDriver } from "../src/api/rathena/ConfigDriver";
import { readCliArgs } from "../src/api/util/cli";
import { options } from "../src/api/options";
import { createYamlDriver } from "../src/api/rathena/YamlDriver";

export async function resetDatabases({
  cfg,
  logger,
}: {
  cfg: ConfigDriver;
  logger: Logger;
}) {
  const args = readCliArgs({
    ...pick(options, "rAthenaPath", "adminPermissionName", "rAthenaMode"),
    ADMIN_USER: { type: "string", required: true },
    ADMIN_PASSWORD: { type: "string", required: true },
  });
  const yaml = createYamlDriver({ ...args, logger });
  const user = createUserRepository({ ...args, yaml });
  const db = createDatabaseDriver(cfg);

  const initializeDBSql = await fs.promises.readFile(
    path.resolve(args.rAthenaPath, "sql-files", "main.sql"),
    "utf-8"
  );

  for (const driver of [db.login, db.map, db.char]) {
    await driver.useConnection(async (conn) => {
      try {
        const { database } = await driver.dbInfo;
        logger.log(`Truncating database for driver "${driver.name}"`);
        await runSqlQuery(conn, createTruncateDBQuery(database));
        logger.log(`Initializing DB for driver "${driver.name}"`);
        await runSqlQuery(conn, initializeDBSql);
      } catch (e) {
        logger.error(`Error initializing DB for driver "${driver.name}": ${e}`);
      }
    });
  }

  const newAccountIds = await db.login.table("login").insert({
    userid: args.ADMIN_USER,
    user_pass: args.ADMIN_PASSWORD,
    email: "admin@localhost",
    group_id: (await user.adminGroupIds)[0],
  });

  if (!newAccountIds.length) {
    logger.error("Failed to create admin account");
    return false;
  }

  await db.destroy();
  return true;
}

function runSqlQuery(conn: mysql.Connection, query: string) {
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

function createTruncateDBQuery(database: string) {
  return [
    `DROP DATABASE IF EXISTS ${database}`,
    `CREATE DATABASE ${database}`,
    `USE ${database};`,
  ].join(";");
}
