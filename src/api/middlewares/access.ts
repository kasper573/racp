import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import { UserAccessLevel } from "../services/user/types";

export function access(requiredAccessLevel: UserAccessLevel) {
  return t.middleware(({ next, ctx: { auth, ...rest } }) => {
    if (!auth || auth.access < requiredAccessLevel) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        ...rest,
        auth,
      },
    });
  });
}
