import { pick } from "lodash";
import { createLogger } from "../src/lib/logger";
import { readCliArgs } from "../src/lib/cli";
import { options } from "../src/api/options";
import { createDatabaseDriver } from "../src/api/rathena/DatabaseDriver";

/**
 * Updates an rAthena build with the settings we need to run racp + rathena in CI.
 */
async function configureRAthena() {
  const logger = createLogger(console.log).chain("configureRAthena");
  const args = readCliArgs({
    ...pick(options, "rAthenaPath"),
    MYSQL_HOST: { type: "string", required: true },
    MYSQL_PORT: { type: "number", required: true },
    MYSQL_USER: { type: "string", required: true },
    MYSQL_PASSWORD: { type: "string", required: true },
    MYSQL_DATABASE: { type: "string", required: true },
  });

  const db = createDatabaseDriver({ ...args, logger });
  logger.log(`Updating ${db.info.file.filename}...`);
  db.info.file.write(
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

  logger.log("Finished configuring RAthena");
}

if (require.main === module) {
  configureRAthena();
}
