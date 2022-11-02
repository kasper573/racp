import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import sqlts from "@rmp135/sql-ts";
import { pick } from "lodash";
import * as zod from "zod";
import { readCliArgs } from "../src/cli";
import { createOptions } from "../src/api/options";
import { createLogger } from "../src/lib/logger";
import {
  createRAthenaDatabaseDriver,
  dbInfoConfigName,
} from "../src/api/rathena/RAthenaDatabaseDriver";

/**
 * Generates zod type & typescript definitions of the rAthena mysql database
 */
async function generate() {
  const { rAthenaPath, template } = readCliArgs({
    ...pick(createOptions(), "rAthenaPath"),
    template: {
      default: "login_server",
      description:
        `The prefix of which params in ${dbInfoConfigName} to use. ` +
        "Will determine the sql database to load type information from.",
    },
  });

  const db = createRAthenaDatabaseDriver({
    rAthenaPath,
    logger: createLogger(console.log),
  });

  const tsString = await sqlts.toTypeScript({
    client: "mysql",
    template: path.resolve(__dirname, "DatabaseDriver.codegen.hbs"),
    connection: await db.info.read(template),
    tableNameCasing: "pascal",
    enumNameCasing: "pascal",
    globalOptionality: "required",
    typeMap,
  });

  const outputPath = path.resolve(
    __dirname,
    "../src/api/rathena/DatabaseDriver.types.ts"
  );

  fs.writeFileSync(outputPath, tsString, "utf-8");
  execSync(`prettier --write ${outputPath}`);
}

type MysqlTypes = string[];
const typeMap: Partial<Record<keyof typeof zod, MysqlTypes>> = {
  // These were missing in the default typeMap
  unknown: ["blob"],
  number: ["mediumint", "decimal", "float", "int", "enum"],
  date: ["datetime", "date"], // Redefining because zod date is lowercase, but default is capitalized
};

if (require.main === module) {
  generate();
}
