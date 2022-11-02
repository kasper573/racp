import { pick } from "lodash";
import { createLogger } from "../src/lib/logger";
import { readCliArgs } from "../src/cli";
import { options } from "../src/api/options";
import { createRAthenaDatabaseDriver } from "../src/api/rathena/RAthenaDatabaseDriver";
import { DBInfo } from "../src/api/rathena/DBInfoDriver";

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

  const db = createRAthenaDatabaseDriver({ ...args, logger });
  logger.log(`Updating ${db.info.file.filename}...`);
  const success = await db.info.update(
    db.all.reduce(
      (changes: Record<string, DBInfo>, driver) => ({
        ...changes,
        [driver.name]: {
          host: args.MYSQL_HOST,
          port: args.MYSQL_PORT,
          user: args.MYSQL_USER,
          password: args.MYSQL_PASSWORD,
          database: args.MYSQL_DATABASE,
        },
      }),
      {}
    )
  );

  if (!success) {
    logger.error(`Failed to update ${db.info.file.filename}`);
    return 1;
  }

  logger.log("Finished configuring RAthena");
  return 0;
}

if (require.main === module) {
  configureRAthena().then(process.exit);
}
