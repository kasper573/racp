import { ResourceFactory } from "../../resources";
import { UserGroupResolver } from "./util/UserGroupResolver";
import { UserAccessLevel } from "./types";

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
    groupIdToUserLevel: async (groupId: number): Promise<UserAccessLevel> => {
      return (await adminGroupIds).includes(groupId)
        ? UserAccessLevel.Admin
        : UserAccessLevel.User;
    },
    userLevelToGroupId: async (level: UserAccessLevel): Promise<number> => {
      if (level === UserAccessLevel.Admin) {
        return (await adminGroupIds)[0];
      }
      return 0;
    },
  };
}
