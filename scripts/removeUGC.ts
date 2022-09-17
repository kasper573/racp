import * as path from "path";
import * as fs from "fs";
import { pick } from "lodash";
import { readCliArgs } from "../src/api/util/cli";
import { options } from "../src/api/options";

async function removeUGC() {
  const args = readCliArgs(pick(options, "dataFolder", "publicFolder"));
  const dataFolder = path.join(__dirname, "..", args.dataFolder);
  const publicFolder = path.join(__dirname, "..", args.publicFolder);
  await Promise.all([
    fs.promises.rm(dataFolder, { recursive: true }),
    fs.promises.rm(publicFolder, { recursive: true }),
  ]);
}

removeUGC();
