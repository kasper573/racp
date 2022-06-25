import { createRpcHandlers } from "../../lib/rpc/createRpcHandlers";
import { RpcException } from "../../lib/rpc/RpcException";
import { Authenticator } from "../authenticator";
import { authDefinition, User } from "./auth.definition";

export function createAuthHandlers(users: User[], auth: Authenticator) {
  return createRpcHandlers(authDefinition.entries, {
    async login({ username, password }) {
      const user = users.find(
        (candidate) =>
          candidate.username === username &&
          auth.compare(password, candidate.passwordHash)
      );
      if (!user) {
        throw new RpcException("Invalid credentials");
      }
      return { token: auth.sign(user.id), user };
    },
  });
}
