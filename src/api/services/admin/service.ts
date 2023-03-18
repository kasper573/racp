import * as zod from "zod";
import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";

export type AdminService = ReturnType<typeof createAdminService>;

export function createAdminService(getRACPLog: () => string) {
  return t.router({
    racpLog: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.string())
      .query(getRACPLog),
  });
}
