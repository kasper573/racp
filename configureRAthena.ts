import * as fs from "fs";
import * as path from "path";
import { pick } from "lodash";
import * as mysql from "mysql";
import { Logger } from "./src/lib/logger";
import { readCliArgs } from "./src/api/util/cli";
import { options } from "./src/api/options";
import { createLogger } from "./src/lib/logger";
import { createConfigDriver } from "./src/api/rathena/ConfigDriver";

/**
 * Updates a clean rathena build with the settings we need to run racp + rathena in docker.
 */
async function configureRAthena() {
  const args = readCliArgs({
    ...pick(options, "rAthenaPath"),
    MYSQL_HOST: { type: "string" },
    MYSQL_PORT: { type: "number" },
    MYSQL_USER: { type: "string" },
    MYSQL_PASSWORD: { type: "string" },
    MYSQL_DATABASE: { type: "string" },
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

  conn.destroy();
  console.log("Finished configuring RAthena");
}

async function runSqlFile(
  conn: mysql.Connection,
  logger: Logger,
  file: string
) {
  const sql = await fs.promises.readFile(file, "utf-8");

  try {
    await new Promise<void>((resolve, reject) =>
      conn.query(sql, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })
    );
  } catch (e) {
    logger.log(`Error while running sql file "${file}": ${e}`);
    process.exit(1);
  }
}

configureRAthena();
