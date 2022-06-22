import * as http from "http";
import * as path from "path";
import * as express from "express";
import cors = require("cors");
import { Request as JWTRequest } from "express-jwt";
import { createRpcMiddleware } from "../utils/rpc/createRpcMiddleware";
import { loadEnvVars } from "../utils/loadEnvVars";
import { serviceDefinition } from "./service.definition";
import { createServiceHandlers } from "./service.handlers";
import { createAuthenticator } from "./authenticator";
import { usersFixture } from "./fixtures/users";

const rootDir = path.resolve(__dirname, "..", "..");
const env = loadEnvVars(rootDir, /^api_/);

const app = express();
const auth = createAuthenticator({ secret: env.api_jwtSecret ?? "" });
const isAuthenticated = (req: JWTRequest) => !!req.auth;

const port = env.api_port;
const users = usersFixture(auth, env.api_adminPassword);
const items: string[] = ["Initial"];

app.use(auth.middleware);
app.use(cors());
app.use(
  createRpcMiddleware(
    serviceDefinition,
    createServiceHandlers(items, users, auth),
    isAuthenticated
  )
);

http.createServer(app).listen(port, () => {
  console.log(`API is running on port ${port}`);
});
