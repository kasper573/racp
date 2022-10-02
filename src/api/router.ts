import { t } from "./trpc";
import { UtilService } from "./services/util/service";
import { UserService } from "./services/user/service";
import { MonsterService } from "./services/monster/service";
import { MetaService } from "./services/meta/service";
import { MapService } from "./services/map/service";
import { ItemService } from "./services/item/service";
import { ConfigService } from "./services/config/service";
import { DropService } from "./services/drop/service";
import { VendorService } from "./services/vendor/service";

export function createApiRouter(services: ApiServices) {
  return t.router(services);
}

export type ApiServices = {
  util: UtilService;
  user: UserService;
  config: ConfigService;
  item: ItemService;
  monster: MonsterService;
  drop: DropService;
  vendor: VendorService;
  map: MapService;
  meta: MetaService;
};

export type ApiRouter = ReturnType<typeof createApiRouter>;
