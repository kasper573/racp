import { createRpcHandlers } from "../../../lib/rpc/createRpcHandlers";
import { RpcException } from "../../../lib/rpc/RpcException";
import { RADB } from "../radb";
import { Authenticator } from "./authenticator";
import { authDefinition } from "./auth.definition";

export function createAuthHandlers(db: RADB, auth: Authenticator) {
  return createRpcHandlers(authDefinition.entries, {
    async login({ username, password }) {
      const user = await db("login")
        .select("account_id", "userid", "group_id")
        .where("userid", "=", username)
        .where("user_pass", "=", password)
        .whereIn("group_id", auth.adminGroupIds.map(String))
        .first();

      if (!user) {
        throw new RpcException("Invalid credentials");
      }
      return { token: auth.sign(user.account_id), user };
    },
  });
}
