import * as http from "http";
import * as path from "path";
import * as express from "express";
import cors = require("cors");
import { Request as JWTRequest } from "express-jwt";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createRpcMiddlewareFactory } from "../lib/rpc/createRpcMiddleware";
import { createFileStore } from "../lib/fs/createFileStore";
import { createLogger } from "../lib/logger";
import { createPublicFileLinker } from "../lib/fs/createPublicFileLinker";
import { createImageFormatter } from "../lib/image/createImageFormatter";
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
import { createUserService } from "./services/user/service";
import { createUtilService } from "./services/util/service";
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
import { UserAccessLevel } from "./services/user/types";
import { timeColor } from "./common/timeColor";
import { createApiRouter } from "./services/router";
import { RpcContext } from "./services/t";

const args = readCliArgs(options);
const logger = createLogger(
  {
    verbose: console.log,
    truncated: createEllipsisLogFn(process.stdout),
  }[args.log],
  { timeColor }
);

const app = express();
const authenticator = createAuthenticator({ secret: args.jwtSecret, ...args });
const { sign } = authenticator;
const yaml = createYamlDriver({ ...args, logger });
const config = createConfigDriver({ ...args, logger });
const db = createDatabaseDriver(config);
const files = createFileStore(
  path.join(process.cwd(), args.dataFolder),
  logger
);
const npc = createNpcDriver({ ...args, logger });
const rpc = createRpcMiddlewareFactory<UserAccessLevel, RpcContext>({
  validatorFor: authenticator.validatorFor,
  logger,
  getContext: ({ auth }: JWTRequest<AuthenticatorPayload>) => ({ auth }),
});

const formatter = createImageFormatter({ extension: ".png", quality: 70 });

const linker = createPublicFileLinker({
  directory: path.join(process.cwd(), args.publicFolder),
  hostname: args.hostname,
  port: args.apiPort,
});

const user = createUserRepository({ yaml, ...args });
const maps = createMapRepository({ files, linker, formatter, npc, logger });
const items = createItemRepository({
  ...args,
  yaml,
  files,
  formatter,
  linker,
  logger,
});
const monsters = createMonsterRepository({
  ...args,
  yaml,
  npc,
  formatter,
  linker,
  logger,
});

linkDropsWithItems(items, monsters);

app.use(authenticator.middleware);
app.use(cors());
app.use(express.static(linker.directory));
app.use(rpc(configDefinition, configController(config)));
app.use(rpc(itemDefinition, itemController(items)));
app.use(rpc(monsterDefinition, monsterController(monsters)));
app.use(rpc(mapDefinition, mapController(maps)));
app.use(rpc(metaDefinition, metaController({ items, monsters })));

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: createApiRouter({
      util: createUtilService(),
      user: createUserService({ db, user, sign, ...args }),
    }),
    createContext: ({ req }: { req: JWTRequest<AuthenticatorPayload> }) => ({
      auth: req.auth,
    }),
  })
);

http.createServer(app).listen(args.apiPort, args.hostname, () => {
  console.log(`API is running on port ${args.apiPort}`);
});
