import { t } from "./t";
import { createUtilService } from "./util/service";

export function createApiRouter() {
  return t.router({
    util: createUtilService(),
  });
}

export type ApiRouter = ReturnType<typeof createApiRouter>;
