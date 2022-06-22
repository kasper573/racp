import * as zod from "zod";
import { createRpcDefinitions } from "../utils/rpc/createRpcDefinitions";

export type User = zod.infer<typeof user>;

const user = zod.object({
  id: zod.string(),
  username: zod.string(),
  passwordHash: zod.string(),
});

export type PublicUser = zod.infer<typeof publicUser>;

const publicUser = user.omit({ passwordHash: true });

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
    argument: zod.object({
      username: zod.string(),
      password: zod.string(),
    }),
    result: zod.object({ token: zod.string(), user: publicUser }),
    intent: "mutation",
  },
});
