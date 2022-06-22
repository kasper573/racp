import * as zod from "zod";
import { createRpcDefinitions } from "../../utils/rpc/createRpcDefinitions";

export const todoDefinition = createRpcDefinitions({
  list: {
    argument: zod.string().optional(),
    result: zod.array(zod.string()),
    intent: "query",
  },
  add: {
    argument: zod.string(),
    result: zod.void(),
    intent: "mutation",
    auth: true,
  },
  remove: {
    argument: zod.string(),
    result: zod.boolean(),
    intent: "mutation",
  },
});
