import * as zod from "zod";
import { createRpcDefinition } from "../../utils/rpc/createRpcDefinition";

export const configName = zod.string();
export const configContent = zod.string();
export const config = configContent;

export const configUpdate = zod.object({
  name: configName,
  content: configContent,
});

export const configDefinition = createRpcDefinition({
  tagTypes: ["Config"],
  entries: (builder) =>
    builder
      .query("listConfigs", zod.void(), zod.array(zod.string()), {
        auth: false,
        tags: ["Config"],
      })
      .query("getConfig", configName, config, {
        auth: false,
        tags: (r, e, configName) => [{ type: "Config", id: configName }],
      })
      .mutation("updateConfig", configUpdate, zod.void(), {
        auth: false,
        tags: (r, e, { name }) => [{ type: "Config", id: name }],
      }),
});
