import * as http from "http";
import * as express from "express";
import cors = require("cors");
import { createRpcMiddlewareFactory } from "../lib/rpc/createRpcMiddleware";
import { configDefinition } from "./services/config/definition";
import { configController } from "./services/config/controller";
import { createAuthenticator } from "./services/auth/Authenticator";
import { authDefinition } from "./services/auth/definition";
import { authController } from "./services/auth/controller";
import { itemDefinition } from "./services/item/definition";
import { itemController } from "./services/item/controller";
import { createRAES } from "./services/raes";
import { readCliArgs } from "./util/cli";
import { options } from "./options";
import { createRACFG } from "./services/racfg";
import { createRADB } from "./services/radb";

const args = readCliArgs(options);
const app = express();
const auth = createAuthenticator({ secret: args.jwtSecret, ...args });
const raes = createRAES(args);
const racfg = createRACFG(args.rAthenaPath);
const radb = createRADB(racfg);
const rpc = createRpcMiddlewareFactory(auth.validatorFor);

app.use(auth.middleware);
app.use(cors());
app.use(rpc(configDefinition, configController(racfg)));
app.use(rpc(itemDefinition, itemController({ raes, ...args })));
app.use(rpc(authDefinition, authController({ radb, raes, auth, ...args })));

http.createServer(app).listen(args.port, () => {
  console.log(`API is running on port ${args.port}`);
});
