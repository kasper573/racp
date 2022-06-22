import * as http from "http";
import * as path from "path";
import * as express from "express";
import cors = require("cors");
import expressBasicAuth = require("express-basic-auth");
import { createRpcMiddleware } from "../utils/rpc/createRpcMiddleware";
import { loadEnvVars } from "../utils/loadEnvVars";
import { serviceDefinition } from "./service.definition";
import { createServiceHandlers } from "./service.handlers";

const rootDir = path.resolve(__dirname, "..", "..");
const env = loadEnvVars(rootDir, /^api_/);

const adminPassword = env.api_adminPassword;
const adminUsername = env.api_adminUsername;
const users = adminPassword &&
  adminUsername && { [adminUsername]: adminPassword };

const port = env.api_port;
const database: string[] = [];
const app = express();
const authHandler = users ? expressBasicAuth({ users }) : undefined;

app.use(cors());
app.use(
  createRpcMiddleware(
    serviceDefinition,
    createServiceHandlers(database),
    authHandler
  )
);

http.createServer(app).listen(port, () => {
  console.log(`API is running on port ${port}`);
});
