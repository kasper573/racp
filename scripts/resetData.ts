import * as path from "path";
import * as fs from "fs";
import { pick } from "lodash";
import recursiveReadDir = require("recursive-readdir");
import * as mysql from "mysql";
import { readCliArgs } from "../src/api/util/cli";
import { options } from "../src/api/options";
import { createLogger } from "../src/lib/logger";
import { createConfigDriver } from "../src/api/rathena/ConfigDriver";
import { createYamlDriver } from "../src/api/rathena/YamlDriver";
import { createUserRepository } from "../src/api/services/user/repository";
import { createDatabaseDriver } from "../src/api/rathena/DatabaseDriver";

async function resetData() {
  const logger = createLogger(console.log).chain("removeUGC");
  const args = readCliArgs({
    ...pick(
      options,
      "rAthenaPath",
      "rAthenaMode",
      "adminPermissionName",
      "dataFolder",
      "publicFolder"
    ),
    ADMIN_USER: { type: "string", required: true },
    ADMIN_PASSWORD: { type: "string", required: true },
  });

  // Remove uploaded files
  logger.log("Removing uploaded files...");
  const dataFolder = path.join(__dirname, "..", args.dataFolder);
  const publicFolder = path.join(__dirname, "..", args.publicFolder);
  await Promise.all([
    recursiveRemoveFiles(dataFolder),
    recursiveRemoveFiles(publicFolder),
  ]);

  // Reset databases
  const yaml = createYamlDriver({ ...args, logger });
  const user = createUserRepository({ ...args, yaml });
  const cfg = createConfigDriver({ ...args, logger });
  const db = createDatabaseDriver(cfg);

  const initializeDBSql = await fs.promises.readFile(
    path.resolve(args.rAthenaPath, "sql-files", "main.sql"),
    "utf-8"
  );

  for (const one of db.all) {
    await one.useConnection(async (conn) => {
      try {
        const { database } = await one.dbInfo;
        logger.log(`Truncating database for driver "${one.name}"`);
        await runSqlQuery(conn, createTruncateDBQuery(database));
        logger.log(`Initializing DB for driver "${one.name}"`);
        await runSqlQuery(conn, initializeDBSql);
      } catch (e) {
        logger.error(`Error initializing DB for driver "${one.name}": ${e}`);
      }
    });
  }

  const newAccountIds = await db.login.table("login").insert({
    userid: args.ADMIN_USER,
    user_pass: args.ADMIN_PASSWORD,
    email: "admin@localhost",
    group_id: (await user.adminGroupIds)[0],
  });

  await db.destroy();

  if (!newAccountIds.length) {
    logger.error("Failed to create admin account");
    return 1;
  }

  return 0;
}

async function recursiveRemoveFiles(path: string) {
  const files = await recursiveReadDir(path);
  await Promise.all(files.map((file) => fs.promises.rm(file)));
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

if (require.main === module) {
  resetData().then(process.exit);
}
