import { t } from "./t";
import { UtilService } from "./util/service";
import { UserService } from "./user/service";
import { MonsterService } from "./monster/service";

export function createApiRouter(services: ApiServices) {
  return t.router(services);
}

export type ApiServices = {
  util: UtilService;
  user: UserService;
  monster: MonsterService;
};

export type ApiRouter = ReturnType<typeof createApiRouter>;
