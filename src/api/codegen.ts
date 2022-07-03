import * as fs from "fs";
import * as path from "path";
import sqlts from "@rmp135/sql-ts";
import { pick } from "lodash";
import { readCliArgs } from "./util/cli";
import { options } from "./options";
import { createRACFG, dbInfoConfigName } from "./util/racfg";

/**
 * Generates typescript definitions of the rAthena mysql database
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
    connection: await cfg.presets.dbInfo(template),
    ...codegenStylePreferences,
  });

  fs.writeFileSync(
    path.resolve(__dirname, "util", "radb", "radb.types.ts"),
    tsString,
    "utf-8"
  );
}

const codegenStylePreferences = {
  columnNameCasing: "camel",
  tableNameCasing: "pascal",
  enumNameCasing: "pascal",
  enumKeyCasing: "pascal",
} as const;

generate();
