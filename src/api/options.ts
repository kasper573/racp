import * as path from "path";
import { donationEnvironments } from "./services/donation/types";

// Common yargs CLI argument options used in most scripts

export const options = {
  hostname: {
    type: "string",
    description: "The hostname to run the api server on",
    default: "localhost",
  },
  apiPort: {
    type: "number",
    description: "The port to run the api server on",
  },
  log: {
    choices: ["verbose", "truncated"] as const,
    default: "verbose",
  },
  jwtSecret: {
    type: "string",
    required: true,
    description: "Used for auth encryption. Should be unique and secret",
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
    coerce: ensureAbsolutePath,
    required: true,
    description: "Path to your rAthena folder (absolute or relative to root)",
  },
  dataFolder: {
    type: "string",
    default: "data",
    coerce: ensureAbsolutePath,
    description:
      "Folder to store non-public file uploads in (absolute or relative to root)",
  },
  publicFolder: {
    type: "string",
    default: "assets",
    coerce: ensureAbsolutePath,
    description:
      "Folder to mount public web server files in (absolute or relative to root)",
  },
  donationEnvironment: {
    type: "string",
    choices: donationEnvironments,
    default: "sandbox",
  },
  exposeInternalErrors: {
    type: "boolean",
    default: false,
    description:
      "Set to true to share stack traces and error messages for internal server errors with clients.",
  },
  preloadAllResources: {
    type: "boolean",
    default: false,
    description:
      "All resources will be preloaded on server start instead of on demand. Delays the server start, " +
      "but improves user experience for API consumers. Recommended for production, " +
      "but can be disabled for development for improved DX.",
  },
} as const;

const rootFolder = path.resolve(__dirname, "../../");
function ensureAbsolutePath(possiblyRelativePath: string) {
  return path.isAbsolute(possiblyRelativePath)
    ? possiblyRelativePath
    : path.resolve(rootFolder, possiblyRelativePath);
}
