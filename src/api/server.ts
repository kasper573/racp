import * as http from "http";
import * as path from "path";
import * as express from "express";
import cors = require("cors");
import { Request as JWTRequest } from "express-jwt";
import * as trpcExpress from "@trpc/server/adapters/express";
import * as morgan from "morgan";
import { createFileStore } from "../lib/fs/createFileStore";
import { createLogger } from "../lib/logger";
import { createPublicFileLinker } from "../lib/fs/createPublicFileLinker";
import { createImageFormatter } from "../lib/image/createImageFormatter";
import { createEllipsisLogFn } from "../lib/createEllipsisLogFn";
import { createYamlDriver } from "./rathena/YamlDriver";
import { createConfigDriver } from "./rathena/ConfigDriver";
import { createDatabaseDriver } from "./rathena/DatabaseDriver";
import { createConfigService } from "./services/config/service";
import {
  AuthenticatorPayload,
  createAuthenticator,
} from "./services/user/util/Authenticator";
import { createUserService } from "./services/user/service";
import { createUtilService } from "./services/util/service";
import { createItemService } from "./services/item/service";
import { readCliArgs } from "./util/cli";
import { options } from "./options";
import { createMonsterService } from "./services/monster/service";
import { createScriptDriver } from "./rathena/ScriptDriver";
import { createMetaService } from "./services/meta/service";
import { createItemRepository } from "./services/item/repository";
import { createMonsterRepository } from "./services/monster/repository";
import { createMapService } from "./services/map/service";
import { createMapRepository } from "./services/map/repository";
import { createUserRepository } from "./services/user/repository";
import { timeColor } from "./common/timeColor";
import { ApiRouter, createApiRouter } from "./router";
import { createDropRepository } from "./services/drop/repository";
import { createDropService } from "./services/drop/service";
import { createVendorService } from "./services/vendor/service";
import { createShopService } from "./services/shop/service";
import { createShopRepository } from "./services/shop/repository";
import { createNpcRepository } from "./services/npc/repository";
import { createNpcService } from "./services/npc/service";
import { createAdminSettingsService } from "./services/settings/service";
import { createDonationService } from "./services/donation/service";
import { createAdminSettingsRepository } from "./services/settings/repository";

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
const script = createScriptDriver({ ...args, logger });
const formatter = createImageFormatter({ extension: ".png", quality: 70 });
const linker = createPublicFileLinker({
  directory: path.join(process.cwd(), args.publicFolder),
  hostname: args.hostname,
  port: args.apiPort,
});

let router: ApiRouter;

// prettier-ignore
{
  const user = createUserRepository({ yaml, ...args });
  const items = createItemRepository({ ...args, yaml, files, formatter, linker, logger, });
  const monsters = createMonsterRepository({ ...args, yaml, script, formatter, linker, logger, });
  const maps = createMapRepository({ files, linker, formatter, getSpawns: monsters.getSpawns, script, logger, });
  const npcs = createNpcRepository({ script, logger });
  const drops = createDropRepository({ items, monsters, logger });
  const shops = createShopRepository({ script, logger, getItems: items.getItems, });
  const settings = createAdminSettingsRepository(files);

  router = createApiRouter({
    util: createUtilService(),
    config: createConfigService(config),
    user: createUserService({ db, user, sign, ...args }),
    item: createItemService(items),
    monster: createMonsterService({ db, repo: monsters }),
    drop: createDropService(drops),
    vendor: createVendorService({ db, items }),
    shop: createShopService(shops),
    npc: createNpcService(npcs),
    map: createMapService(maps),
    meta: createMetaService({ items, monsters }),
    settings: createAdminSettingsService(settings),
    donation: createDonationService({
      db,
      env: args.donationEnvironment,
      settings,
      logger,
    }),
  })
}

app.use(authenticator.middleware);
app.use(cors());
app.use(express.static(linker.directory));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(
  trpcExpress.createExpressMiddleware({
    onError({ error, path }) {
      logger
        .chain("trpc")
        .error(`/${path}`, error.name, `${error.message}: ${error.stack}`);
    },
    router,
    createContext: ({ req }: { req: JWTRequest<AuthenticatorPayload> }) => ({
      auth: req.auth,
    }),
  })
);

http.createServer(app).listen(args.apiPort, "0.0.0.0", () => {
  console.log(`API is running on port ${args.apiPort}`);
});
