import { createRpcDefinitionFactory } from "../../lib/rpc/createRpcDefinition";
import { UserAccessLevel } from "../services/user/types";
import { createRpcControllerFactory } from "../../lib/rpc/createRpcController";
import { AuthenticatorPayload } from "../services/user/util/Authenticator";

export const createRpcDefinition = createRpcDefinitionFactory({
  auth: UserAccessLevel.Guest,
});

export const createRpcController = createRpcControllerFactory<RpcContext>();

export interface RpcContext {
  auth?: AuthenticatorPayload;
}
