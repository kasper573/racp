import * as zod from "zod";
import { createRpcDefinitions } from "../utils/rpc/createRpcDefinitions";

export const apiServiceDefinition = createRpcDefinitions({
  getHello: {
    argument: zod.number(),
    result: zod.array(zod.string()),
    intent: "query",
  },
});
