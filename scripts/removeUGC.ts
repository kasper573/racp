import * as path from "path";
import * as fs from "fs";
import { pick } from "lodash";
import recursiveReadDir = require("recursive-readdir");
import { readCliArgs } from "../src/api/util/cli";
import { options } from "../src/api/options";
import { createLogger } from "../src/lib/logger";
import { createConfigDriver } from "../src/api/rathena/ConfigDriver";
import { resetDatabases } from "./resetDatabases";

async function removeUGC() {
  const logger = createLogger(console.log).chain("removeUGC");
  const args = readCliArgs(
    pick(options, "rAthenaPath", "dataFolder", "publicFolder")
  );

  // Remove uploaded data
  logger.log("Removing uploaded data...");
  const dataFolder = path.join(__dirname, "..", args.dataFolder);
  const publicFolder = path.join(__dirname, "..", args.publicFolder);
  await Promise.all([
    recursiveRemoveFiles(dataFolder),
    recursiveRemoveFiles(publicFolder),
  ]);

  // Reset databases
  const cfg = createConfigDriver({ ...args, logger });
  const success = await resetDatabases({ cfg, logger });
  return success ? 0 : 1;
}

async function recursiveRemoveFiles(path: string) {
  const files = await recursiveReadDir(path);
  await Promise.all(files.map((file) => fs.promises.rm(file)));
}

if (require.main === module) {
  removeUGC().then(process.exit);
}
