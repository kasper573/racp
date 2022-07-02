import "dotenv-flow/config";
import yargs = require("yargs");
import { Options } from "yargs";

export function parseArgs(args: readonly string[], env: Env) {
  const options = {
    port: {
      type: "number",
      description: "The port to run the api server on",
    },
    jwtSecret: {
      type: "string",
      required: true,
      description: "Used for auth encryption. Should be unique and secret",
    },
    adminPassword: { type: "string", default: "" },
    rAthenaMode: { choices: ["Renewal", "Prerenewal"], default: "Renewal" },
    tradeScale: {
      type: "number",
      default: 2,
      description: "The scale that determines undefined item buy/sell values",
    },
    rAthenaPath: {
      type: "string",
      required: true,
      description: "Absolute path to your rAthena folder",
    },
  } as const;

  loadEnvDefaults(options, env);

  return yargs(args).version(false).options(options).parseSync();
}

function loadEnvDefaults(options: Record<string, Options>, env: Env) {
  for (const key in env) {
    const option = options[key];
    if (option && option.default === undefined) {
      option.default = env[key];
    }
  }
}

type Env = Record<string, string | undefined>;
