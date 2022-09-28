import { t } from "./t";
import { UtilService } from "./util/service";
import { UserService } from "./user/service";

export function createApiRouter(services: ApiServices) {
  return t.router(services);
}

export type ApiServices = {
  util: UtilService;
  user: UserService;
};

export type ApiRouter = ReturnType<typeof createApiRouter>;
