import * as path from "path";
import * as fs from "fs";
import { groupBy, pick, uniq } from "lodash";
import recursiveReadDir = require("recursive-readdir");
import * as mysql from "mysql";
import { readCliArgs } from "../src/lib/cli";
import { options } from "../src/api/options";
import { createLogger } from "../src/lib/logger";
import { createUserRepository } from "../src/api/services/user/repository";
import {
  createDatabaseDriver,
  DatabaseDriver,
} from "../src/api/rathena/DatabaseDriver";
import {
  adminAccountId,
  adminAccountPin,
  adminCharId,
  adminCharName,
} from "../cypress/support/vars";
import { createResourceManager } from "../src/api/resources";
import { createAdminSettingsRepository } from "../src/api/services/settings/repository";

async function resetData() {
  const logger = createLogger(console.log).chain("removeUGC");
  const args = readCliArgs({
    ...pick(
      options,
      "rAthenaPath",
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

  const db = createDatabaseDriver({ ...args, logger });
  for (const { driver, group } of await groupDatabaseDrivers(db)) {
    await driver.useConnection(async (conn) => {
      const { database } = await driver.dbInfo();
      logger.log(`Truncating database for drivers: ${group}`);
      await runSqlQuery(conn, createTruncateDBQuery(database));
      const sqlFiles = uniq(
        group.map((name) => path.resolve(args.rAthenaPath, sqlFilesPerDb[name]))
      );
      for (const sqlFile of sqlFiles) {
        const sqlQuery = await fs.promises.readFile(sqlFile, "utf-8");
        logger.log(`Executing sql file: ${sqlFile}`);
        await runSqlQuery(conn, sqlQuery);
      }
    });
  }

  const settings = createAdminSettingsRepository({ ...args, logger });
  const { create: resources } = createResourceManager({
    logger,
    settings,
    ...args,
  });

  // Insert admin account and character
  const user = createUserRepository({ resources, ...args });
  await db.login.table("login").insert({
    account_id: adminAccountId,
    userid: args.ADMIN_USER,
    user_pass: args.ADMIN_PASSWORD,
    email: "admin@localhost",
    group_id: (await user.adminGroupIds)[0],
    pincode: adminAccountPin,
  });

  await db.char.table("char").insert({
    account_id: adminAccountId,
    char_id: adminCharId,
    name: adminCharName,
  });

  await db.destroy();

  return 0;
}

const sqlFilesPerDb: Record<string, string> = {
  login_server: "sql-files/main.sql",
  map_server: "sql-files/main.sql",
  char_server: "sql-files/main.sql",
  log_db: "sql-files/logs.sql",
};

async function groupDatabaseDrivers(db: DatabaseDriver) {
  const dbInfos = await Promise.all(db.all.map((one) => one.dbInfo()));
  const ids = dbInfos.map((one) => `${one.host}:${one.port}:${one.database}`);
  const lookup = Object.values(
    groupBy(db.all, (one) => ids[db.all.indexOf(one)])
  );
  return Object.values(lookup).map((drivers) => {
    const [driver] = drivers;
    const group = drivers.map((g) => g.name);
    return { driver, group };
  });
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
