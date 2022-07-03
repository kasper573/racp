import { createRpcHandlers } from "../../../lib/rpc/createRpcHandlers";
import { RpcException } from "../../../lib/rpc/RpcException";
import { RADB } from "../radb";
import { createRAESResolver, RAES } from "../raes";
import { Authenticator } from "./authenticator";
import { authDefinition } from "./auth.definition";
import { userGroupType } from "./auth.types";

export function createAuthHandlers({
  radb,
  raes,
  auth,
  adminPermissionName = "",
}: {
  radb: RADB;
  raes: RAES;
  auth: Authenticator;
  adminPermissionName?: string;
}) {
  const groups = raes.resolve("conf/groups.yml", userGroupResolver);
  const adminGroupIds = Array.from(groups.values())
    .filter((group) => group.Permissions[adminPermissionName])
    .map((group) => group.Id);

  return createRpcHandlers(authDefinition.entries, {
    async login({ username, password }) {
      const user = await radb("login")
        .select("account_id", "userid", "group_id")
        .where("userid", "=", username)
        .where("user_pass", "=", password)
        .whereIn("group_id", adminGroupIds.map(String))
        .first();

      if (!user) {
        throw new RpcException("Invalid credentials");
      }
      return { token: auth.sign(user.account_id), user };
    },
  });
}

const userGroupResolver = createRAESResolver(userGroupType, {
  getKey: (group) => group.Id,
});
