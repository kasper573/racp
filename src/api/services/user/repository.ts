import { ResourceFactory } from "../../resources";
import { UserGroupResolver } from "./util/UserGroupResolver";

export type UserRepository = ReturnType<typeof createUserRepository>;

export function createUserRepository({
  adminPermissionName = "",
  resources,
}: {
  adminPermissionName?: string;
  resources: ResourceFactory;
}) {
  const groupsResource = resources.yaml("conf/groups.yml", UserGroupResolver);
  const adminGroupIds = groupsResource.map("adminGroupIds", (groups) => {
    const ids = Array.from(groups.values())
      .filter((group) => group.Permissions[adminPermissionName])
      .map((group) => group.Id);

    if (ids.length === 0) {
      groupsResource.logger.warn(
        `Admin access disabled. No user groups with the permission "${adminPermissionName}" could be found.`
      );
    }

    return ids;
  });

  return {
    adminGroupIds,
  };
}
