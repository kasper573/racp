import { t } from "./t";
import { UtilService } from "./util/service";
import { UserService } from "./user/service";
import { MonsterService } from "./monster/service";
import { MetaService } from "./meta/service";
import { MapService } from "./map/service";
import { ItemService } from "./item/service";
import { ConfigService } from "./config/service";

export function createApiRouter(services: ApiServices) {
  return t.router(services);
}

export type ApiServices = {
  util: UtilService;
  user: UserService;
  config: ConfigService;
  item: ItemService;
  monster: MonsterService;
  map: MapService;
  meta: MetaService;
};

export type ApiRouter = ReturnType<typeof createApiRouter>;
