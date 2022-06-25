import * as zod from "zod";
import { createRpcDefinition } from "../../utils/rpc/createRpcDefinition";

export const configName = zod.string();
export const configContent = zod.string();
export const config = configContent;

export const configUpdate = zod.object({
  name: configName,
  content: configContent,
});

export const configDefinition = createRpcDefinition((builder) =>
  builder
    .query("listConfigs", zod.void(), zod.array(zod.string()), { auth: false })
    .query("getConfig", configName, config, { auth: true })
    .mutation("updateConfig", configUpdate, zod.void(), { auth: true })
);
