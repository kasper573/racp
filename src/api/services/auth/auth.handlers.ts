import { createRpcHandlers } from "../../../lib/rpc/createRpcHandlers";
import { RpcException } from "../../../lib/rpc/RpcException";
import { Authenticator } from "../../util/authenticator";
import { authDefinition } from "./auth.definition";
import { InternalUser } from "./auth.types";

export function createAuthHandlers(users: InternalUser[], auth: Authenticator) {
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
