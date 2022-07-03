import { createRpcDefinitionFactory } from "../../lib/rpc/createRpcDefinition";
import { UserAccessLevel } from "../services/auth/types";

export const createRpcDefinition = createRpcDefinitionFactory(
  UserAccessLevel.Guest
);
