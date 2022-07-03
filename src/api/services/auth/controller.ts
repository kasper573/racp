import { createRpcController } from "../../../lib/rpc/createRpcController";
import { RpcException } from "../../../lib/rpc/RpcException";
import { RADatabaseDriver } from "../../radb";
import { RAEntitySystem } from "../../../lib/rathena/RAEntitySystem";
import { Authenticator } from "./util/Authenticator";
import { authDefinition } from "./definition";
import { UserAccessLevel } from "./types";
import { UserGroupResolver } from "./util/UserGroupResolver";

export function authController({
  radb,
  raes,
  auth,
  adminPermissionName = "",
}: {
  radb: RADatabaseDriver;
  raes: RAEntitySystem;
  auth: Authenticator;
  adminPermissionName?: string;
}) {
  const groups = raes.resolve("conf/groups.yml", UserGroupResolver);
  const adminGroupIds = Array.from(groups.values())
    .filter((group) => group.Permissions[adminPermissionName])
    .map((group) => group.Id);

  return createRpcController(authDefinition.entries, {
    async login({ username, password }) {
      const user = await radb.login
        .table("login")
        .select("account_id", "userid", "group_id")
        .where("userid", "=", username)
        .where("user_pass", "=", password)
        .first();

      if (!user) {
        throw new RpcException("Invalid credentials");
      }

      const id = user.account_id;
      const access = adminGroupIds.includes(user.group_id)
        ? UserAccessLevel.Admin
        : UserAccessLevel.User;

      return {
        token: auth.sign({ id, access }),
        user: { id, username: user.userid, access },
      };
    },
  });
}
