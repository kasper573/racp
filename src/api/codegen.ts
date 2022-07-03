import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import sqlts from "@rmp135/sql-ts";
import { pick } from "lodash";
import * as zod from "zod";
import { readCliArgs } from "./util/cli";
import { options } from "./options";
import { createRACFG, dbInfoConfigName } from "./services/racfg";

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

  const cfg = createRACFG(rAthenaPath);
  const tsString = await sqlts.toTypeScript({
    client: "mysql",
    template: path.resolve(__dirname, "codegen.hbs"),
    connection: await cfg.presets.dbInfo(template),
    tableNameCasing: "pascal",
    enumNameCasing: "pascal",
    typeMap,
  });

  const filename = path.resolve(__dirname, "services", "radb.types.ts");
  fs.writeFileSync(filename, tsString, "utf-8");
  execSync(`prettier --write ${filename}`);
}

type MysqlTypes = string[];
const typeMap: Partial<Record<keyof typeof zod, MysqlTypes>> = {
  // These were missing in the default typeMap
  unknown: ["blob"],
  number: ["mediumint", "decimal", "float", "int", "enum"],
  date: ["datetime", "date"], // Redefining because zod date is lowercase, but default is capitalized
};

generate();
