import * as http from "http";
import * as express from "express";
import cors = require("cors");
import { Request as JWTRequest } from "express-jwt";
import { createRpcMiddlewareFactory } from "../lib/rpc/createRpcMiddleware";
import { loadEnvVars } from "../../env";
import { configDefinition } from "./services/config/config.definition";
import { createConfigHandlers } from "./services/config/config.handlers";
import { createAuthenticator } from "./util/authenticator";
import { usersFixture } from "./fixtures/users";
import { authDefinition } from "./services/auth/auth.definition";
import { createAuthHandlers } from "./services/auth/auth.handlers";
import { itemDefinition } from "./services/item/item.definition";
import { createItemHandlers } from "./services/item/item.handlers";
import { createRAES } from "./util/raes";

// Vars
const env = loadEnvVars(/^api_/);
const port = env.api_port;
const secret = env.api_jwtSecret ?? "";
const rAthenaPath = env.api_rAthenaPath ?? "";
const rAthenaMode = env.api_rAthenaMode ?? "";
const tradeScale = parseFloat(env.api_tradeScale ?? "");

// Mechanics
const app = express();
const auth = createAuthenticator({ secret });
const raes = createRAES({ rAthenaPath, mode: rAthenaMode });
const rpc = createRpcMiddlewareFactory((req: JWTRequest) => !!req.auth);
const users = usersFixture(auth, env.api_adminPassword);

app.use(auth.middleware);
app.use(cors());
app.use(rpc(configDefinition.entries, createConfigHandlers(rAthenaPath)));
app.use(rpc(authDefinition.entries, createAuthHandlers(users, auth)));
app.use(rpc(itemDefinition.entries, createItemHandlers({ raes, tradeScale })));

http.createServer(app).listen(port, () => {
  console.log(`API is running on port ${port}`);
});
