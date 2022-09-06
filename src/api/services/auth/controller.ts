import { createRpcController } from "../../../lib/rpc/createRpcController";
import { RpcException } from "../../../lib/rpc/RpcException";
import { DatabaseDriver } from "../../rathena/DatabaseDriver";
import { YamlDriver } from "../../rathena/YamlDriver";
import { Authenticator } from "./util/Authenticator";
import { authDefinition } from "./definition";
import { UserAccessLevel } from "./types";
import { UserGroupResolver } from "./util/UserGroupResolver";

export async function authController({
  db,
  yaml,
  auth,
  adminPermissionName = "",
}: {
  db: DatabaseDriver;
  yaml: YamlDriver;
  auth: Authenticator;
  adminPermissionName?: string;
}) {
  const groups = await yaml.resolve("conf/groups.yml", UserGroupResolver);
  const adminGroupIds = Array.from(groups.values())
    .filter((group) => group.Permissions[adminPermissionName])
    .map((group) => group.Id);

  return createRpcController(authDefinition.entries, {
    async login({ username, password }) {
      const user = await db.login
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

export async function createUser(
  db: DatabaseDriver,
  user: {
    username: string;
    password: string;
    email: string;
    group: UserAccessLevel;
  }
) {
  await db.login.table("login").insert({
    userid: user.username,
    user_pass: user.password,
    email: user.email,
    group_id: user.group,
  });
}
