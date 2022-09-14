import * as http from "http";
import * as path from "path";
import * as express from "express";
import cors = require("cors");
import { createRpcMiddlewareFactory } from "../lib/rpc/createRpcMiddleware";
import { createFileStore } from "../lib/createFileStore";
import { createLogger } from "../lib/logger";
import { createPublicFileLinker } from "../lib/createPublicFileLinker";
import { createImageFormatter } from "../lib/createImageFormatter";
import { createEllipsisLogFn } from "../lib/createEllipsisLogFn";
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
import { metaDefinition } from "./services/meta/definition";
import { metaController } from "./services/meta/controller";
import { createItemRepository } from "./services/item/repository";
import { createMonsterRepository } from "./services/monster/repository";
import { mapDefinition } from "./services/map/definition";
import { mapController } from "./services/map/controller";
import { createMapRepository } from "./services/map/repository";
import { linkDropsWithItems } from "./services/item/util/linkDropsWithItems";
import { createAuthRepository } from "./services/auth/repository";
import { utilDefinition } from "./services/util/definition";
import { utilController } from "./services/util/controller";

const args = readCliArgs(options);
const logger = createLogger(
  {
    verbose: console.log,
    truncated: createEllipsisLogFn(process.stdout),
  }[args.log]
);

const app = express();
const authenticator = createAuthenticator({ secret: args.jwtSecret, ...args });
const { sign } = authenticator;
const yaml = createYamlDriver({ ...args, logger: logger.chain("yaml") });
const config = createConfigDriver({ ...args, logger: logger.chain("config") });
const db = createDatabaseDriver(config);
const files = createFileStore(
  path.join(process.cwd(), "data"),
  logger.chain("fs")
);
const npc = createNpcDriver({ ...args, logger: logger.chain("npc") });
const rpc = createRpcMiddlewareFactory(authenticator.validatorFor, {
  logger: logger.chain("rpc"),
});

const formatter = createImageFormatter({ extension: ".png", quality: 70 });

const linker = createPublicFileLinker({
  directory: path.join(process.cwd(), "assets"),
  hostname: args.hostname,
  port: args.apiPort,
});

const auth = createAuthRepository({ yaml, ...args });
const items = createItemRepository({ yaml, files, ...args });
const maps = createMapRepository({ files, linker, formatter, npc });
const monsters = createMonsterRepository({
  ...args,
  yaml,
  npc,
  formatter,
  linker,
});

linkDropsWithItems(items, monsters);

app.use(authenticator.middleware);
app.use(cors());
app.use(express.static(linker.directory));
app.use(rpc(configDefinition, configController(config)));
app.use(rpc(itemDefinition, itemController(items)));
app.use(rpc(authDefinition, authController({ db, auth, sign, ...args })));
app.use(rpc(monsterDefinition, monsterController(monsters)));
app.use(rpc(mapDefinition, mapController(maps)));
app.use(rpc(metaDefinition, metaController({ items, monsters })));
app.use(rpc(utilDefinition, utilController()));

http.createServer(app).listen(args.apiPort, args.hostname, () => {
  console.log(`API is running on port ${args.port}`);
});
