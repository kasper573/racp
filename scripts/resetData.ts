import * as path from "path";
import * as fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { groupBy, pick, uniq } from "lodash";
import recursiveReadDir = require("recursive-readdir");
import * as mysql from "mysql";
import { readCliArgs } from "../src/cli";
import { options } from "../src/api/options";
import { createLogger } from "../src/lib/logger";
import { createUserRepository } from "../src/api/services/user/repository";
import {
  createRAthenaDatabaseDriver,
  RAthenaDatabaseDriver,
} from "../src/api/rathena/RAthenaDatabaseDriver";
import {
  adminAccountId,
  adminAccountPin,
  adminCharId,
  adminCharName,
} from "../cypress/support/vars";
import { createResourceManager } from "../src/api/resources";
import { createAdminSettingsRepository } from "../src/api/services/settings/repository";
const execAsync = promisify(exec);

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
  await Promise.all([
    recursiveRemoveFiles(args.dataFolder),
    recursiveRemoveFiles(args.publicFolder),
  ]);

  // Reset rAthena databases

  const radb = createRAthenaDatabaseDriver({ ...args, logger });
  for (const { driver, group } of await groupDatabaseDrivers(radb)) {
    await driver.useConnection(async (conn) => {
      const { database } = await driver.dbInfo();
      logger.log(`Truncating database for drivers: ${group}`);
      await runSqlQuery(conn, createTruncateDBQuery(database));
      const relativeSqlFiles = uniq(
        group.map((driverName) => sqlFilesPerDb[driverName])
      );
      for (const relativeSqlFile of relativeSqlFiles) {
        const [sqlFile, sqlQuery] = await resolveRAthenaSqlFile(
          args.rAthenaPath,
          relativeSqlFile
        );
        logger.log(`Executing sql file: ${sqlFile}`);
        await runSqlQuery(conn, sqlQuery);
      }
    });
  }

  // Reset RACP database
  const { stdout, stderr } = await execAsync(
    "npx prisma migrate reset --force",
    { cwd: path.resolve(__dirname, "..") }
  );
  if (stderr) {
    logger.error(stderr);
  }
  if (stdout) {
    logger.log(stdout);
  }

  const settings = createAdminSettingsRepository({ ...args, logger });
  const { create: resources } = createResourceManager({
    logger,
    settings,
    ...args,
  });

  // Insert admin account and character
  const user = createUserRepository({ resources, ...args });
  await radb.login.table("login").insert({
    account_id: adminAccountId,
    userid: args.ADMIN_USER,
    user_pass: args.ADMIN_PASSWORD,
    email: "admin@localhost",
    group_id: (await user.adminGroupIds)[0],
    pincode: adminAccountPin,
  });

  await radb.char.table("char").insert({
    account_id: adminAccountId,
    char_id: adminCharId,
    name: adminCharName,
  });

  await radb.destroy();

  return 0;
}

const sqlFilesPerDb: Record<string, string> = {
  login_server: "sql-files/main.sql",
  map_server: "sql-files/main.sql",
  char_server: "sql-files/main.sql",
  log_db: "sql-files/logs.sql",
};

async function resolveRAthenaSqlFile(
  rAthenaPath: string,
  sqlFileRelativePath: string
) {
  const localSqlFile = path.resolve(rAthenaPath, sqlFileRelativePath);
  try {
    return [
      localSqlFile,
      await fs.promises.readFile(localSqlFile, "utf8"),
    ] as const;
  } catch {
    const fallbackSqlFile = path.resolve(
      __dirname,
      "../node_modules/rathena",
      sqlFileRelativePath
    );
    return [
      fallbackSqlFile,
      await fs.promises.readFile(fallbackSqlFile, "utf8"),
    ] as const;
  }
}

async function groupDatabaseDrivers(db: RAthenaDatabaseDriver) {
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
  let files: string[];
  try {
    files = await recursiveReadDir(path);
  } catch {
    return; // Nothing to remove
  }
  await Promise.all(files.map((file) => fs.promises.rm(file)));
}

function runSqlQuery(conn: mysql.Connection, query: string) {
  return new Promise<void>((resolve, reject) =>
    conn.query(query, (err) => {
      if (err) {
        reject(`${err}`.slice(0, 150));
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
