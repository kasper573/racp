import * as fs from "fs";

export function ensureDir(directory: string) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
  return directory;
}
