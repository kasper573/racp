import { createRpcDefinitionFactory } from "../../lib/rpc/createRpcDefinition";

export type UserRole = "admin" | "user" | "guest";

export const createRpcDefinition =
  createRpcDefinitionFactory<UserRole>("guest");
