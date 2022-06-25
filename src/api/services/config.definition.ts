import * as zod from "zod";
import { createRpcDefinition } from "../../utils/rpc/createRpcDefinition";
import { createTagFactory } from "../../utils/createTagFactory";

export const configName = zod.string();
export const configContent = zod.string();
export const config = configContent;

export const configUpdate = zod.object({
  name: configName,
  content: configContent,
});

const tag = createTagFactory("Config");

export const configDefinition = createRpcDefinition({
  tagTypes: [tag.type],
  entries: (builder) =>
    builder
      .query("listConfigs", zod.void(), zod.array(zod.string()), {
        auth: false,
        tags: [tag.list],
      })
      .query("getConfig", configName, config, {
        auth: false,
        tags: (r, e, configName) => [tag.one(configName)],
      })
      .mutation("updateConfig", configUpdate, zod.void(), {
        auth: false,
        tags: (r, e, { name }) => [tag.one(name)],
      }),
});
