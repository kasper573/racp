import * as zod from "zod";
import { TRPCError } from "@trpc/server";
import { ConfigDriver } from "../../rathena/ConfigDriver";
import { t } from "../t";
import { access } from "../../middlewares/access";
import { UserAccessLevel } from "../user/types";

export type ConfigService = ReturnType<typeof createConfigService>;

export function createConfigService(cfg: ConfigDriver) {
  return t.router({
    list: t.procedure
      .use(access(UserAccessLevel.Admin))
      .output(zod.array(zod.string()))
      .query(() => cfg.list()),
    read: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(zod.string())
      .output(zod.string())
      .query(async ({ input: configName }) => {
        try {
          return await cfg.read(configName);
        } catch {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Config not found",
          });
        }
      }),
    update: t.procedure
      .use(access(UserAccessLevel.Admin))
      .input(zod.object({ name: zod.string(), content: zod.string() }))
      .mutation(async ({ input: { name, content } }) => {
        try {
          await cfg.update(name, content);
        } catch {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Config not found",
          });
        }
      }),
  });
}
