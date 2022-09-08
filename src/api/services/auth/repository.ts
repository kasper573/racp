import { YamlDriver } from "../../rathena/YamlDriver";
import { UserGroupResolver } from "./util/UserGroupResolver";

export type AuthRepository = ReturnType<typeof createAuthRepository>;

export function createAuthRepository({
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
