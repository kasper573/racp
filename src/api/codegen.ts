import * as fs from "fs";
import * as path from "path";
import sqlts from "@rmp135/sql-ts";
import { pick } from "lodash";
import { readCliArgs } from "./util/cli";
import { options } from "./options";

async function go() {
  const { rAthenaPath } = readCliArgs(pick(options, "rAthenaPath"));

  const tsString = await sqlts.toTypeScript({
    client: "mysql",
    columnNameCasing: "camel",
    tableNameCasing: "pascal",
    enumNameCasing: "pascal",
    enumKeyCasing: "pascal",
    connection: {
      host: "localhost",
      user: "ragnarok",
      password: "ragnarok",
      database: "ragnarok",
    },
  });

  fs.writeFileSync(
    path.resolve(__dirname, "util", "radb", "radb.types.ts"),
    tsString,
    "utf-8"
  );
}

go();
