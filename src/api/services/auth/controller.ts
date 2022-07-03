import { groupBy } from "lodash";
import { createRpcController } from "../../../lib/rpc/createRpcController";
import { RpcException } from "../../../lib/rpc/RpcException";
import { RADB } from "../radb";
import { createRAESResolver, RAES } from "../raes";
import { Authenticator } from "./Authenticator";
import { authDefinition } from "./definition";
import { UserAccessLevel, userGroupType } from "./types";

export function authController({
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

  return createRpcController(authDefinition.entries, {
    async login({ username, password }) {
      const user = await radb("login")
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

const userGroupResolver = createRAESResolver(userGroupType, {
  getKey: (group) => group.Id,
  postProcess(group, registry) {
    const nameLookup = groupBy(Array.from(registry.values()), "Name");
    for (const [groupName, inherit] of Object.entries(group.Inherit)) {
      const parent = nameLookup[groupName]?.[0];
      if (inherit && parent) {
        group.Permissions = { ...parent.Permissions, ...group.Permissions };
        group.CharCommands = { ...parent.CharCommands, ...group.CharCommands };
        group.Commands = { ...parent.Commands, ...group.Commands };
      }
    }
  },
});
