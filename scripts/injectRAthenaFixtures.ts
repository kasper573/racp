import * as path from "path";
import { pick } from "lodash";
import { readCliArgs } from "../src/lib/cli";
import { options } from "../src/api/options";
import { createLogger } from "../src/lib/logger";
const copy = require("recursive-copy");

async function injectRAthenaFixtures() {
  const logger = createLogger(console.log).chain("injectRAthenaFixtures");
  const args = readCliArgs(pick(options, "rAthenaPath"));
  logger.log("Injecting rAthena fixtures...");
  const fixtureFolder = path.join(__dirname, "../cypress/fixtures/rathena");
  await copy(fixtureFolder, args.rAthenaPath, { overwrite: true });
  return 0;
}

if (require.main === module) {
  injectRAthenaFixtures().then(process.exit);
}
