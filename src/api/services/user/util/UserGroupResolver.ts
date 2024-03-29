import { groupBy } from "lodash";
import { createYamlResolver } from "../../../rathena/YamlRepository";
import { userGroupType } from "../types";

export const UserGroupResolver = createYamlResolver(userGroupType, {
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
