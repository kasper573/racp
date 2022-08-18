import * as http from "http";
import * as path from "path";
import * as express from "express";
import cors = require("cors");
import { createRpcMiddlewareFactory } from "../lib/rpc/createRpcMiddleware";
import { createFileStore } from "../lib/createFileStore";
import { createLogger } from "../lib/logger";
import { createEllipsisLogFn } from "../lib/createEllipsisLogFn";
import { createPublicFileLinker } from "../lib/createPublicFileLinker";
import { createImageFormatter } from "../lib/createImageFormatter";
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

const args = readCliArgs(options);
const logger = createLogger(
  {
    verbose: console.log,
    truncated: createEllipsisLogFn(process.stdout),
  }[args.log]
);

const app = express();
const auth = createAuthenticator({ secret: args.jwtSecret, ...args });
const yaml = createYamlDriver({ ...args, logger: logger.chain("yaml") });
const config = createConfigDriver({ ...args, logger: logger.chain("config") });
const db = createDatabaseDriver(config);
const files = createFileStore(path.join(process.cwd(), "data"));
const npc = createNpcDriver({ ...args, logger: logger.chain("npc") });
const rpc = createRpcMiddlewareFactory(auth.validatorFor, {
  logger: logger.chain("rpc"),
});

const formatter = createImageFormatter({ extension: ".png", quality: 70 });

const linker = createPublicFileLinker({
  directory: path.join(process.cwd(), "public"),
  hostname: args.hostname,
  port: args.port,
});

const itemRepository = createItemRepository({ yaml, files, ...args });
const monsterRepository = createMonsterRepository({ ...args, yaml, npc });
const mapRepository = createMapRepository({ files, linker, formatter });

app.use(auth.middleware);
app.use(cors());
app.use(express.static(linker.directory));
app.use(rpc(configDefinition, configController(config)));
app.use(rpc(itemDefinition, itemController(itemRepository)));
app.use(rpc(authDefinition, authController({ db, yaml, auth, ...args })));
app.use(rpc(monsterDefinition, monsterController(monsterRepository)));
app.use(rpc(mapDefinition, mapController(mapRepository)));
app.use(
  rpc(
    metaDefinition,
    metaController({ items: itemRepository, monsters: monsterRepository })
  )
);

http.createServer(app).listen(args.port, args.hostname, () => {
  console.log(`API is running on port ${args.port}`);
});
