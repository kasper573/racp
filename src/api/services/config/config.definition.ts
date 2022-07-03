import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../../util/rpc";
import { UserAccessLevel } from "../auth/auth.types";

const tag = createTagFactory("Config");

export const configDefinition = createRpcDefinition({
  auth: UserAccessLevel.Admin,
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query("listConfigs", zod.void(), zod.array(zod.string()), {
        tags: [tag.list],
      })
      .query("getConfig", zod.string(), zod.string(), {
        tags: (r, e, configName) => [tag.one(configName)],
      })
      .mutation(
        "updateConfig",
        zod.object({
          name: zod.string(),
          content: zod.string(),
        }),
        zod.void(),
        { tags: (r, e, { name }) => [tag.one(name)] }
      ),
});
