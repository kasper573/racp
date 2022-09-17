import * as path from "path";
import * as fs from "fs";
import { pick } from "lodash";
import recursiveReadDir = require("recursive-readdir");
import { readCliArgs } from "../src/api/util/cli";
import { options } from "../src/api/options";

async function removeUGC() {
  const args = readCliArgs(pick(options, "dataFolder", "publicFolder"));
  const dataFolder = path.join(__dirname, "..", args.dataFolder);
  const publicFolder = path.join(__dirname, "..", args.publicFolder);
  await Promise.all([
    recursiveRemoveFiles(dataFolder),
    recursiveRemoveFiles(publicFolder),
  ]);
}

async function recursiveRemoveFiles(path: string) {
  const files = await recursiveReadDir(path);
  await Promise.all(files.map((file) => fs.promises.rm(file)));
}

removeUGC();
