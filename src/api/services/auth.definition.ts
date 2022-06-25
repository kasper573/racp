import * as zod from "zod";
import { createRpcDefinition } from "../../lib/rpc/createRpcDefinition";

export type User = zod.infer<typeof user>;

const user = zod.object({
  id: zod.string(),
  username: zod.string(),
  passwordHash: zod.string(),
});

export type PublicUser = zod.infer<typeof publicUser>;

const publicUser = user.omit({ passwordHash: true });

export const authDefinition = createRpcDefinition({
  entries: (builder) =>
    builder.mutation(
      "login",
      zod.object({
        username: zod.string(),
        password: zod.string(),
      }),
      zod.object({ token: zod.string(), user: publicUser })
    ),
});
