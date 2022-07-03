import "dotenv-flow/config";
import { Options } from "yargs";
import yargs = require("yargs");

export function readCliArgs<T extends Record<string, Options>>(options: T) {
  return yargs(withEnvArgs(process.argv.slice(2), options))
    .version(false)
    .options(options)
    .parseSync();
}

/**
 * Returns a new args array with env values for all given option names.
 * If argument is already provided the env value will be ignored.
 */
function withEnvArgs(args: string[], options: Record<string, Options>) {
  const updatedArgs: string[] = args.slice();

  for (const key in process.env) {
    const value = process.env[key];
    const option = options[key];
    if (args.includes(arg(key)) || !value || !option) {
      continue;
    }
    if (option.array) {
      for (const item of value.split(",")) {
        updatedArgs.push(arg(key), item);
      }
    } else {
      updatedArgs.push(arg(key), value);
    }
  }

  return updatedArgs;
}

const arg = (key: string) => `--${key}`;
