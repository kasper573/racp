import { YamlDriver } from "../../rathena/YamlDriver";
import { UserGroupResolver } from "./util/UserGroupResolver";

export type UserRepository = ReturnType<typeof createUserRepository>;

export function createUserRepository({
  yaml,
  adminPermissionName = "",
}: {
  yaml: YamlDriver;
  adminPermissionName?: string;
}) {
  const groups = yaml.resolve("conf/groups.yml", UserGroupResolver);
  const adminGroupIds = groups.then((groups) =>
    Array.from(groups.values())
      .filter((group) => group.Permissions[adminPermissionName])
      .map((group) => group.Id)
  );

  return {
    adminGroupIds,
  };
}
