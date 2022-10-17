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
  const groups = resources.yaml("conf/groups.yml", UserGroupResolver);

  const adminGroupIds = groups.read().then((groups) =>
    Array.from(groups.values())
      .filter((group) => group.Permissions[adminPermissionName])
      .map((group) => group.Id)
  );

  return {
    adminGroupIds,
  };
}
