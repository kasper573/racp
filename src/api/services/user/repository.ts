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
  const adminGroupIds = groupsResource.map("adminGroupIds", (groupsMap) => {
    const groups = Array.from(groupsMap.values());
    const ids = groups
      .filter((group) => group.Permissions[adminPermissionName])
      .map((group) => group.Id);

    if (groups.length > 0 && ids.length === 0) {
      groupsResource.logger.warn(
        `No user groups with the permission "${adminPermissionName}" could be found.`
      );
    }

    return ids;
  });

  return {
    adminGroupIds,
  };
}
