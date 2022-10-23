import * as http from "http";
import * as path from "path";
import * as express from "express";
import cors = require("cors");
import { Request as JWTRequest } from "express-jwt";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createLogger } from "../lib/logger";
import { createPublicFileLinker } from "../lib/fs/createPublicFileLinker";
import { createImageFormatter } from "../lib/image/createImageFormatter";
import { readCliArgs } from "../lib/cli";
import { loggerToMorgan } from "../lib/loggerToMorgan";
import { createDatabaseDriver } from "./rathena/DatabaseDriver";
import {
  AuthenticatorPayload,
  createAuthenticator,
} from "./services/user/util/Authenticator";
import { createUserService } from "./services/user/service";
import { createUtilService } from "./services/util/service";
import { createItemService } from "./services/item/service";
import { options } from "./options";
import { createMonsterService } from "./services/monster/service";
import { createMetaService } from "./services/meta/service";
import { createItemRepository } from "./services/item/repository";
import { createMonsterRepository } from "./services/monster/repository";
import { createMapService } from "./services/map/service";
import { createMapRepository } from "./services/map/repository";
import { createUserRepository } from "./services/user/repository";
import { createApiRouter } from "./router";
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
import { createResourceManager } from "./resources";
import { coloredConsole, logFormat } from "./common/logFormat";
import { createSkillRepository } from "./services/skill/repository";
import { createSkillService } from "./services/skill/service";

const args = readCliArgs(options);
const logger = createLogger(coloredConsole, { format: logFormat });

const app = express();
const auth = createAuthenticator({ secret: args.jwtSecret, ...args });
const db = createDatabaseDriver({ ...args, logger });
const formatter = createImageFormatter({ extension: ".png", quality: 70 });
const linker = createPublicFileLinker({
  directory: path.join(process.cwd(), args.publicFolder),
  hostname: args.hostname,
  port: args.apiPort,
});

const resourceManager = createResourceManager({
  logger,
  formatter,
  linker,
  ...args,
});

const resources = resourceManager.create;
const npcs = createNpcRepository(resources);
const settings = createAdminSettingsRepository(resources);
const user = createUserRepository({ ...args, resources });
const items = createItemRepository({ ...args, resources });
const monsters = createMonsterRepository({ ...args, resources });
const drops = createDropRepository({ ...items, ...monsters });
const shops = createShopRepository({ ...items, resources });
const maps = createMapRepository({ ...monsters, resources });
const skills = createSkillRepository(resources);

const router = createApiRouter({
  util: createUtilService(),
  user: createUserService({ db, user, sign: auth.sign, ...args }),
  item: createItemService(items),
  monster: createMonsterService({ db, repo: monsters }),
  skill: createSkillService(skills),
  drop: createDropService(drops),
  vendor: createVendorService({ db, items }),
  shop: createShopService(shops),
  npc: createNpcService(npcs),
  map: createMapService(maps),
  settings: createAdminSettingsService(settings),
  meta: createMetaService({ ...items, ...monsters }),
  donation: createDonationService({
    db,
    env: args.donationEnvironment,
    logger,
    settings,
    ...items,
  }),
});

app.use(auth.middleware);
app.use(cors());
app.use(express.static(linker.directory));
app.use(loggerToMorgan(logger.chain("http")));
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
      exposeInternalErrors: args.exposeInternalErrors,
    }),
  })
);

http.createServer(app).listen(args.apiPort, "0.0.0.0", () => {
  logger.log(`API is running on port ${args.apiPort}`);
});
