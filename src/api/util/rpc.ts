import { createRpcDefinitionFactory } from "../../lib/rpc/createRpcDefinition";
import { UserAccessLevel } from "../services/auth/UserAccessLevel";

export const createRpcDefinition = createRpcDefinitionFactory(
  UserAccessLevel.Guest
);
