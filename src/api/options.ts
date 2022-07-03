// Common yargs CLI argument options used in all scripts

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
    choices: ["Renewal", "Prerenewal"],
    default: "Renewal",
  },
  adminGroupIds: {
    type: "number",
    array: true,
    default: [],
    description:
      "The user group ids that make a user an admin. " +
      "If left empty no one will have admin access.",
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
