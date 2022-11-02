import * as path from "path";
import * as dotEnvFlow from "dotenv-flow";
import { Options } from "yargs";
import yargs = require("yargs");

export function readCliArgs<T extends Record<string, Options>>(
  options: T,
  rootFolder: string = path.resolve(__dirname, "..")
) {
  const { parsed: env = process.env } = dotEnvFlow.config({ path: rootFolder });
  return yargs(withEnvArgs(process.argv.slice(2), options, env))
    .version(false)
    .options(options)
    .parserConfiguration({ "strip-aliased": true, "strip-dashed": true })
    .parseSync();
}

/**
 * Returns a new args array with env values for all given option names.
 * If argument is already provided the env value will be ignored.
 */
function withEnvArgs(
  args: string[],
  options: Record<string, Options>,
  env: Record<string, string | undefined>
) {
  const updatedArgs: string[] = args.slice();

  for (const key in env) {
    const value = env[key];
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
