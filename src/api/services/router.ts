import { t } from "./t";
import { UtilService } from "./util/service";
import { UserService } from "./user/service";
import { MonsterService } from "./monster/service";
import { MetaService } from "./meta/service";

export function createApiRouter(services: ApiServices) {
  return t.router(services);
}

export type ApiServices = {
  util: UtilService;
  user: UserService;
  monster: MonsterService;
  meta: MetaService;
};

export type ApiRouter = ReturnType<typeof createApiRouter>;
