import * as zod from "zod";
import { createTagFactory } from "../../../lib/createTagFactory";
import { createRpcDefinition } from "../rpc";

const tag = createTagFactory("Config");

export const configDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query("listConfigs", zod.void(), zod.array(zod.string()), {
        auth: "admin",
        tags: [tag.list],
      })
      .query("getConfig", zod.string(), zod.string(), {
        auth: "admin",
        tags: (r, e, configName) => [tag.one(configName)],
      })
      .mutation(
        "updateConfig",
        zod.object({
          name: zod.string(),
          content: zod.string(),
        }),
        zod.void(),
        {
          auth: "admin",
          tags: (r, e, { name }) => [tag.one(name)],
        }
      ),
});
