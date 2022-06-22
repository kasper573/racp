import * as zod from "zod";
import { createRpcDefinitions } from "../../utils/rpc/createRpcDefinitions";

export const todoDefinition = createRpcDefinitions((builder) =>
  builder
    .query("list", zod.string().optional(), zod.array(zod.string()))
    .mutation("add", zod.string(), zod.void(), { auth: true })
    .mutation("remove", zod.string(), zod.boolean())
);
