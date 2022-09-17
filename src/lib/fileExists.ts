import * as fs from "fs";

export async function fileExists(path: string) {
  try {
    await fs.promises.stat(path);
    return true;
  } catch {
    return false;
  }
}
