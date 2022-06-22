import * as zod from "zod";
import { createRpcDefinitions } from "../utils/rpc/createRpcDefinitions";
import { createResultType } from "../utils/createResultType";

const credentials = zod.object({
  username: zod.string(),
  password: zod.string(),
});

const authResult = createResultType(zod.object({ token: zod.string() }));

export const serviceDefinition = createRpcDefinitions({
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
  login: {
    argument: credentials,
    result: authResult,
    intent: "mutation",
  },
});
