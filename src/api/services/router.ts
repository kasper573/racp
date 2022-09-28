import { t } from "./t";
import { util } from "./util/service";

export function createApiRouter() {
  return t.router({
    util,
  });
}

export type ApiRouter = ReturnType<typeof createApiRouter>;
