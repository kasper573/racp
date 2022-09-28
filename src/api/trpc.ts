import { initTRPC } from "@trpc/server";
import { UserAccessLevel } from "./services/user/types";
import { AuthenticatorPayload } from "./services/user/util/Authenticator";

export const t = initTRPC.context<RpcContext>().meta<RpcMeta>().create();

export type RpcContext = {
  auth?: AuthenticatorPayload;
};

export type RpcMeta = {
  auth?: UserAccessLevel;
};
