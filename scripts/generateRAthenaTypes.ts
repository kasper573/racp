import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import sqlts from "@rmp135/sql-ts";
import { pick } from "lodash";
import * as zod from "zod";
import { readCliArgs } from "../src/lib/cli";
import { options } from "../src/api/options";
import { createLogger } from "../src/lib/logger";
import {
  createConfigDriver,
  dbInfoConfigName,
} from "../src/api/rathena/ConfigDriver";

/**
 * Generates zod type & typescript definitions of the rAthena mysql database
 */
async function generate() {
  const { rAthenaPath, template } = readCliArgs({
    ...pick(options, "rAthenaPath"),
    template: {
      default: "login_server",
      description:
        `The prefix of which params in ${dbInfoConfigName} to use. ` +
        "Will determine the sql database to load type information from.",
    },
  });

  const cfg = createConfigDriver({
    rAthenaPath,
    logger: createLogger(console.log),
  });

  const tsString = await sqlts.toTypeScript({
    client: "mysql",
    template: path.resolve(__dirname, "DatabaseDriver.codegen.hbs"),
    connection: await cfg.presets.dbInfo(template),
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
