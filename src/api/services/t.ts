import { initTRPC } from "@trpc/server";
import { UserAccessLevel } from "./user/types";
import { AuthenticatorPayload } from "./user/util/Authenticator";

export const t = initTRPC.context<RpcContext>().meta<RpcMeta>().create();

export type RpcContext = {
  auth?: AuthenticatorPayload;
};

export type RpcMeta = {
  auth?: UserAccessLevel;
};
