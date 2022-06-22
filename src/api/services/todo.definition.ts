import * as zod from "zod";
import { createRpcDefinition } from "../../utils/rpc/createRpcDefinition";

export const todoDefinition = createRpcDefinition((builder) =>
  builder
    .query("list", zod.string().optional(), zod.array(zod.string()))
    .mutation("add", zod.string(), zod.void(), { auth: true })
    .mutation("remove", zod.string(), zod.boolean())
);
