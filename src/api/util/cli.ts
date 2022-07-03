import "dotenv-flow/config";
import { Options } from "yargs";
import yargs = require("yargs");

export function readCliArgs<T extends Record<string, Options>>(options: T) {
  setEnvDefaults(options);

  return yargs(process.argv.slice(2))
    .version(false)
    .options(options)
    .parseSync();
}

function setEnvDefaults(options: Record<string, Options>) {
  for (const key in process.env) {
    const option = options[key];
    if (option && option.default === undefined) {
      option.default = process.env[key];
    }
  }
}
