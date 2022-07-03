// Common CLI argument options used in all scripts

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
