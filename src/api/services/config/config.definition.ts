import * as zod from "zod";
import { createRpcDefinition } from "../../../lib/rpc/createRpcDefinition";
import { createTagFactory } from "../../../lib/createTagFactory";

const tag = createTagFactory("Config");

export const configDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query("listConfigs", zod.void(), zod.array(zod.string()), {
        auth: false,
        tags: [tag.list],
      })
      .query("getConfig", zod.string(), zod.string(), {
        auth: false,
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
          auth: false,
          tags: (r, e, { name }) => [tag.one(name)],
        }
      ),
});
