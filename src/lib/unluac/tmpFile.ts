import * as path from "path";
import { tmpdir } from "os";
import * as crypto from "crypto";

export function tmpFile(ext: string) {
  return path.join(
    tmpdir(),
    `tmp.${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`
  );
}
