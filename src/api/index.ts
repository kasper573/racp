import * as http from "http";
import * as path from "path";
import * as express from "express";
import cors = require("cors");
import { Request as JWTRequest } from "express-jwt";
import { createRpcMiddlewareFactory } from "../utils/rpc/createRpcMiddleware";
import { loadEnvVars } from "../utils/loadEnvVars";
import { configDefinition } from "./services/config.definition";
import { createConfigHandlers } from "./services/config.handlers";
import { createAuthenticator } from "./authenticator";
import { usersFixture } from "./fixtures/users";
import { authDefinition } from "./services/auth.definition";
import { createAuthHandlers } from "./services/auth.handlers";

const rootDir = path.resolve(__dirname, "..", "..");
const env = loadEnvVars(rootDir, /^api_/);

const app = express();
const auth = createAuthenticator({ secret: env.api_jwtSecret ?? "" });
const isAuthenticated = (req: JWTRequest) => !!req.auth;
const rpc = createRpcMiddlewareFactory(isAuthenticated);

const port = env.api_port;
const users = usersFixture(auth, env.api_adminPassword);

app.use(auth.middleware);
app.use(cors());
app.use(
  rpc(configDefinition.entries, createConfigHandlers(env.api_rAthenaPath ?? ""))
);
app.use(rpc(authDefinition.entries, createAuthHandlers(users, auth)));

http.createServer(app).listen(port, () => {
  console.log(`API is running on port ${port}`);
});
