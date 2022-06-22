import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { typedKeys } from "./typedKeys";

export function loadEnvVars(targetDirectory: string, filter: RegExp) {
  const envFile = path.resolve(targetDirectory, ".env");
  const base = dotenv.parse(safeReadFile(envFile));
  const local = dotenv.parse(safeReadFile(envFile + ".local"));
  const merged = { ...base, ...local };
  return filterObject(merged, filter);
}

function safeReadFile(path: string, fallback = "") {
  try {
    return fs.readFileSync(path, "utf-8");
  } catch {
    return fallback;
  }
}

function filterObject<T extends Record<string, string>>(
  vars: T,
  filter: RegExp
): Partial<T> {
  return typedKeys(vars).reduce(
    (filtered, key) =>
      filter.test(String(key)) ? { ...filtered, [key]: vars[key] } : filtered,
    {} as Partial<T>
  );
}
