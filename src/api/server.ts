import * as http from "http";
import * as path from "path";
import * as express from "express";
import cors = require("cors");
import { createRpcMiddlewareFactory } from "../lib/rpc/createRpcMiddleware";
import { createRAEntitySystem } from "../lib/rathena/RAEntitySystem";
import { createRAConfigDriver } from "../lib/rathena/RAConfigDriver";
import { createFileStore } from "../lib/createFileStore";
import { createRADatabaseDriver } from "./radb";
import { configDefinition } from "./services/config/definition";
import { configController } from "./services/config/controller";
import { createAuthenticator } from "./services/auth/util/Authenticator";
import { authDefinition } from "./services/auth/definition";
import { authController } from "./services/auth/controller";
import { itemDefinition } from "./services/item/definition";
import { itemController } from "./services/item/controller";
import { readCliArgs } from "./util/cli";
import { options } from "./options";

const args = readCliArgs(options);
const app = express();
const auth = createAuthenticator({ secret: args.jwtSecret, ...args });
const raes = createRAEntitySystem(args);
const racd = createRAConfigDriver(args.rAthenaPath);
const radb = createRADatabaseDriver(racd);
const rpc = createRpcMiddlewareFactory(auth.validatorFor, 2 * Math.pow(10, 7));
const fs = createFileStore(path.join(process.cwd(), "data"));

app.use(auth.middleware);
app.use(cors());
app.use(rpc(configDefinition, configController(racd)));
app.use(rpc(itemDefinition, itemController({ raes, fs, ...args })));
app.use(rpc(authDefinition, authController({ radb, raes, auth, ...args })));

http.createServer(app).listen(args.port, () => {
  console.log(`API is running on port ${args.port}`);
});
