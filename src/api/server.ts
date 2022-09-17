import * as http from "http";
import * as path from "path";
import * as express from "express";
import cors = require("cors");
import { Request as JWTRequest } from "express-jwt";
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
import {
  AuthenticatorPayload,
  createAuthenticator,
} from "./services/user/util/Authenticator";
import { userDefinition } from "./services/user/definition";
import { userController } from "./services/user/controller";
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
import { createUserRepository } from "./services/user/repository";
import { utilDefinition } from "./services/util/definition";
import { utilController } from "./services/util/controller";
import { UserAccessLevel } from "./services/user/types";
import { RpcContext } from "./util/rpc";

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
  path.join(process.cwd(), args.dataFolder),
  logger.chain("fs")
);
const npc = createNpcDriver({ ...args, logger: logger.chain("npc") });
const rpc = createRpcMiddlewareFactory<UserAccessLevel, RpcContext>({
  validatorFor: authenticator.validatorFor,
  logger: logger.chain("rpc"),
  getContext: ({ auth }: JWTRequest<AuthenticatorPayload>) => ({ auth }),
});

const formatter = createImageFormatter({ extension: ".png", quality: 70 });

const linker = createPublicFileLinker({
  directory: path.join(process.cwd(), args.publicFolder),
  hostname: args.hostname,
  port: args.apiPort,
});

const user = createUserRepository({ yaml, ...args });
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
app.use(rpc(userDefinition, userController({ db, user, sign, ...args })));
app.use(rpc(monsterDefinition, monsterController(monsters)));
app.use(rpc(mapDefinition, mapController(maps)));
app.use(rpc(metaDefinition, metaController({ items, monsters })));
app.use(rpc(utilDefinition, utilController()));

http.createServer(app).listen(args.apiPort, args.hostname, () => {
  console.log(`API is running on port ${args.port}`);
});
