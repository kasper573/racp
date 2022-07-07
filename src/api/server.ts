import * as http from "http";
import * as path from "path";
import * as express from "express";
import cors = require("cors");
import { createRpcMiddlewareFactory } from "../lib/rpc/createRpcMiddleware";
import { createFileStore } from "../lib/createFileStore";
import { createYamlDriver } from "./rathena/YamlDriver";
import { createConfigDriver } from "./rathena/ConfigDriver";
import { createDatabaseDriver } from "./rathena/DatabaseDriver";
import { configDefinition } from "./services/config/definition";
import { configController } from "./services/config/controller";
import { createAuthenticator } from "./services/auth/util/Authenticator";
import { authDefinition } from "./services/auth/definition";
import { authController } from "./services/auth/controller";
import { itemDefinition } from "./services/item/definition";
import { itemController } from "./services/item/controller";
import { readCliArgs } from "./util/cli";
import { options } from "./options";
import { monsterController } from "./services/monster/controller";
import { monsterDefinition } from "./services/monster/definition";
import { createNpcDriver } from "./rathena/NpcDriver";

const args = readCliArgs(options);
const app = express();
const auth = createAuthenticator({ secret: args.jwtSecret, ...args });
const yaml = createYamlDriver(args);
const config = createConfigDriver(args.rAthenaPath);
const db = createDatabaseDriver(config);
const rpc = createRpcMiddlewareFactory(auth.validatorFor, 2 * Math.pow(10, 7));
const fs = createFileStore(path.join(process.cwd(), "data"));
const npc = createNpcDriver(args);

app.use(auth.middleware);
app.use(cors());
app.use(rpc(configDefinition, configController(config)));
app.use(rpc(itemDefinition, itemController({ yaml, fs, ...args })));
app.use(rpc(authDefinition, authController({ db, yaml, auth, ...args })));
app.use(rpc(monsterDefinition, monsterController({ npc })));

http.createServer(app).listen(args.port, () => {
  console.log(`API is running on port ${args.port}`);
});
