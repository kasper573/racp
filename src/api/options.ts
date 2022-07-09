// Common yargs CLI argument options used in all scripts

export const rAthenaModes = ["Renewal", "Prerenewal"] as const;
export type RAthenaMode = typeof rAthenaModes extends Iterable<infer V>
  ? V
  : never;

export const options = {
  port: {
    type: "number",
    description: "The port to run the api server on",
  },
  jwtSecret: {
    type: "string",
    required: true,
    description: "Used for auth encryption. Should be unique and secret",
  },
  rAthenaMode: {
    choices: rAthenaModes,
    default: "Renewal",
  },
  adminPermissionName: {
    type: "string",
    description:
      "The name of the user group permission (rAthena see conf/groups.yml) " +
      "which will determine if a user should be granted admin access to the control panel",
  },
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
