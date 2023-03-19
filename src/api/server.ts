import * as http from "http";
import * as path from "path";
import * as express from "express";
import cors = require("cors");
import { Request as JWTRequest } from "express-jwt";
import * as trpcExpress from "@trpc/server/adapters/express";
import { enableMapSet } from "immer";
import { createLogger } from "../lib/logger";
import { createPublicFileLinker } from "../lib/fs/createPublicFileLinker";
import { createImageFormatter } from "../lib/image/createImageFormatter";
import { readCliArgs } from "../cli";
import { loggerToMorgan } from "../lib/loggerToMorgan";
import { createStreamMemory } from "../lib/createStreamMemory";
import { createRAthenaDatabaseDriver } from "./rathena/RAthenaDatabaseDriver";
import {
  AuthenticatorPayload,
  createAuthenticator,
} from "./services/user/util/Authenticator";
import { createUserService } from "./services/user/service";
import { createUtilService } from "./services/util/service";
import { createItemService } from "./services/item/service";
import { createOptions } from "./options";
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
import { createResourceManager } from "./resources";
import { coloredConsole, logFormat } from "./common/logFormat";
import { createSkillRepository } from "./services/skill/repository";
import { createSkillService } from "./services/skill/service";
import { createAdminSettingsRepository } from "./services/settings/repository";
import { createExpRepository } from "./services/exp/repository";
import { createExpService } from "./services/exp/service";
import { createRACPDatabaseClient } from "./common/createRACPDatabaseClient";
import { createHuntService } from "./services/hunt/service";
import { createAdminService } from "./services/admin/service";
import { createCharacterService } from "./services/character/service";

enableMapSet();

const stdoutMemory = createStreamMemory<string>(
  process.stdout,
  "",
  (text, chunk) => text + String(chunk)
);

const rootFolder = process.cwd();
const args = readCliArgs(createOptions(rootFolder), rootFolder);
const logger = createLogger(coloredConsole, { format: logFormat });

console.log("Starting API with options", args);

const app = express();
const auth = createAuthenticator({ secret: args.jwtSecret, ...args });
const radb = createRAthenaDatabaseDriver({ ...args, logger });
const cpdb = createRACPDatabaseClient();
const formatter = createImageFormatter({ extension: ".png", quality: 70 });
const linker = createPublicFileLinker({
  directory: args.publicFolder,
  hostname: args.linkerHostname ?? args.hostname,
  port: args.linkerPort
    ? args.linkerPort === "false"
      ? undefined
      : parseInt(args.linkerPort, 10)
    : args.apiPort,
});

const settings = createAdminSettingsRepository({ ...args, logger });
const resourceManager = createResourceManager({
  logger,
  formatter,
  linker,
  settings,
  ...args,
});

const resources = resourceManager.create;
const npcs = createNpcRepository(resources);
const user = createUserRepository({ ...args, resources });
const items = createItemRepository({ ...args, resources });
const monsters = createMonsterRepository({ settings, resources });
const drops = createDropRepository({ ...items, ...monsters, resources });
const shops = createShopRepository({ ...items, resources });
const maps = createMapRepository({ ...monsters, resources });
const skills = createSkillRepository(resources);
const exp = createExpRepository(resources);

if (args.validateResources) {
  Promise.all(resourceManager.instances).then(() => {
    const failed =
      resourceManager.instances.filter((r) => r.status.type === "rejected")
        .length > 0;
    failed
      ? logger.error("Resource validation failed")
      : logger.log("Resource validation passed");
    process.exit(failed ? 1 : 0);
  });
} else if (args.preloadResources) {
  Promise.all(resourceManager.instances);
}

const router = createApiRouter({
  admin: createAdminService(stdoutMemory.read),
  util: createUtilService(path.resolve(rootFolder, "bin")),
  user: createUserService({ radb, user, sign: auth.sign, ...args }),
  character: createCharacterService(radb),
  item: createItemService(items),
  monster: createMonsterService({ radb, repo: monsters }),
  skill: createSkillService(skills),
  drop: createDropService(drops),
  vendor: createVendorService({ radb, items }),
  shop: createShopService(shops),
  npc: createNpcService(npcs),
  map: createMapService(maps),
  settings: createAdminSettingsService(settings),
  meta: createMetaService({ ...items, ...monsters }),
  exp: createExpService(exp),
  hunt: createHuntService({ cpdb, settings }),
  donation: createDonationService({
    radb,
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

http
  .createServer(app)
  .listen(args.apiPort, "0.0.0.0", () =>
    logger.log(`API is running on port ${args.apiPort}`)
  );
