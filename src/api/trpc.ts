import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";
import { UserAccessLevel } from "./services/user/types";
import { AuthenticatorPayload } from "./services/user/util/Authenticator";

export const t = initTRPC
  .context<RpcContext>()
  .meta<RpcMeta>()
  .create({
    errorFormatter({ shape, error }) {
      if (error.cause instanceof ZodError) {
        return { ...shape, data: error.cause };
      }
      return { ...shape, data: shape.message };
    },
  });

export type RpcContext = {
  auth?: AuthenticatorPayload;
};

export type RpcMeta = {
  auth?: UserAccessLevel;
};
