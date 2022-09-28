import { createRpcDefinitionFactory } from "../../lib/rpc/createRpcDefinition";
import { UserAccessLevel } from "../services/user/types";
import { createRpcControllerFactory } from "../../lib/rpc/createRpcController";
import { RpcContext } from "../services/t";

export const createRpcDefinition = createRpcDefinitionFactory({
  auth: UserAccessLevel.Guest,
});

export const createRpcController = createRpcControllerFactory<RpcContext>();
