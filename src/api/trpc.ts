import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";
import { omit } from "lodash";
import { UserAccessLevel } from "./services/user/types";
import { AuthenticatorPayload } from "./services/user/util/Authenticator";

export const t = initTRPC
  .context<RpcContext>()
  .meta<RpcMeta>()
  .create({
    errorFormatter({ shape, error, ctx }) {
      // Always expose ZodErrors since they contain validation data
      if (error.cause instanceof ZodError) {
        return { ...shape, data: error.cause };
      }
      // Share all details, but place message as data to normalize the error object.
      if (ctx?.exposeInternalErrors) {
        return { ...shape, data: shape.message };
      }
      // Mask internal details
      return {
        ...shape,
        data: omit(shape.data, "stack"),
        message: "Internal Server Error",
      };
    },
  });

export type RpcContext = {
  auth?: AuthenticatorPayload;
  exposeInternalErrors?: boolean;
};

export type RpcMeta = {
  auth?: UserAccessLevel;
};
