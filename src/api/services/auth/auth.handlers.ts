import { createRpcHandlers } from "../../../lib/rpc/createRpcHandlers";
import { RpcException } from "../../../lib/rpc/RpcException";
import { Authenticator } from "../../util/authenticator";
import { RADB } from "../radb";
import { authDefinition } from "./auth.definition";
import { PublicUser } from "./auth.types";

export function createAuthHandlers(db: RADB, auth: Authenticator) {
  return createRpcHandlers(authDefinition.entries, {
    async login({ username, password }) {
      const user: PublicUser | undefined = await db
        .table("login")
        .select("account_id", "userid")
        .where("userid", "=", username)
        .where("user_pass", "=", password)
        .whereIn("group_id", [0, 99]) // admin
        .first();

      if (!user) {
        throw new RpcException("Invalid credentials");
      }
      return { token: auth.sign(user.account_id), user };
    },
  });
}
